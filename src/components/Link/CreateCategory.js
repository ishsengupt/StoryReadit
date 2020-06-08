import React, { useEffect, useMemo, useState } from "react";
// Import the Slate editor factory.
import { createEditor } from "slate";

// Import the Slate components and React plugin.
import { Slate, Editable, withReact } from "slate-react";
import useFormValidation from "../Auth/useFormValidation";
import validateCreateCategory from "../Auth/validateCreateCategory";
import FirebaseContext from "../../firebase/context";

const INITIAL_STATE = {
  title: ""
};

function CreateCategory(props) {
  const editor = useMemo(() => withReact(createEditor()), []);
  const [visible, setVisible] = useState(true);
  const [desctrue, descSet] = useState(false);
  // Add the initial value when setting up our state.
  const [value, setValue] = useState([
    {
      type: "paragraph",
      children: [{ text: "Description of Genre" }]
    }
  ]);
  const { firebase, user } = React.useContext(FirebaseContext);
  const { handleSubmit, handleChange, values, errors } = useFormValidation(
    INITIAL_STATE,
    validateCreateCategory,
    handleCreateLink
  );

  function hideMe() {
    setVisible(false);
  }
  let style = {};
  if (!visible) style.display = "none";

  function handleCreateLink() {
    if (!user) {
      props.history.push("/login");
    } else {
      const { title } = values;
      console.log(value[0].children[0].text);
      const newLink = {
        title,

        desc: value[0].children[0].text,
        userid: user.uid,
        poster: user.displayName,
        name: title,
        online: 0,
        subscribers: 0,
        numPosts: 0,
        created: Date.now()
      };
      firebase.db
        .collection("category")
        .doc(title)
        .set(newLink);
      props.history.push("/");
    }
  }

  return (
    <div className="category__grid mtother">
      <form onSubmit={handleSubmit} className="form-center">
        <input
          onChange={handleChange}
          value={values.title}
          name="title"
          placeholder="Genre Name"
          autoComplete="off"
          type="title"
          id="genre__create"
          className={errors.title && "error-input"}
        />

        {errors.title && <p className="error-text">{errors.title}</p>}
        <div className="form__margin">
          <Slate
            editor={editor}
            value={value}
            className="slate-editor"
            onChange={newValue => setValue(newValue)}
          >
            <Editable />
          </Slate>

          <button className="button cda-remove" type="submit">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateCategory;
