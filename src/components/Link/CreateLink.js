import React, { useEffect, useMemo, useState } from "react";
// Import the Slate editor factory.
import { createEditor } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import useFormValidation from "../Auth/useFormValidation";
import validateCreateLink from "../Auth/validateCreateLink";
import FirebaseContext from "../../firebase/context";

const INITIAL_STATE = {
  title: "",
  img: ""
};

function CreateLink(props) {
  const sub = props.match.params.sub;
  const editor = useMemo(() => withReact(createEditor()), []);
  const [numerror, setnumError] = React.useState("");
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "Write your story here..." }]
    }
  ]);
  const { firebase, user } = React.useContext(FirebaseContext);
  const { handleSubmit, handleChange, values, errors } = useFormValidation(
    INITIAL_STATE,
    validateCreateLink,
    handleCreateLink
  );

  function handleCreateLink() {
    if (!user) {
      props.history.push("/login");
    } else {
      if (value[0].children[0].text.split(" ").length > 100) {
        console.log("wrong");
        setnumError("Story template must be less than a 100 words");
        return;
      } else {
        const { title, img } = values;
        const newLink = {
          title,
          img,
          category: sub,
          desc: value[0].children[0].text,
          userid: user.uid,
          name: user.displayName,
          voteCount: 0,
          votes: [],
          comments: [],
          created: Date.now(),
          switchVal: 1
        };
        firebase.db.collection("links").add(newLink);
        const voteRef = firebase.db.collection("category").doc(sub);
        voteRef.get().then(doc => {
          if (doc.exists) {
            const prevNum = doc.data().numPosts;
            let newNum = prevNum + 1;
            console.log(doc.data().numPosts);
            firebase.db
              .collection("category")
              .doc(sub)
              .set(
                {
                  numPosts: newNum
                },
                { merge: true }
              );
          }
        });

        props.history.push("/");
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="form-center subreddit-padding mtother"
    >
      {errors.description && <p className="error-text">{errors.description}</p>}
      <input
        onChange={handleChange}
        value={values.title}
        name="title"
        placeholder="The Title of the Story"
        autoComplete="off"
        type="title"
        id="genre__create"
        className={errors.title && "error-input"}
      />
      <input
        onChange={handleChange}
        value={values.img}
        name="img"
        placeholder="Image Url"
        autoComplete="off"
        type="img"
        id="img__create"
        className={errors.img && "error-input"}
      />
      {errors.title && <p className="error-text">{errors.title}</p>}
      <div className="form__margin">
        <Slate
          editor={editor}
          value={value}
          onChange={newValue => setValue(newValue)}
        >
          <Editable />
        </Slate>
        <button className="button cda-remove" type="submit">
          Submit
        </button>
      </div>

      <div style={{ color: "red" }}>{numerror}</div>
    </form>
  );
}

export default CreateLink;
