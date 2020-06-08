export default function validateCreateLink(values) {
  let errors = {};

  // Description Errors
  /*  if (!values.description) {
    errors.description = "Description required";
  } else if (values.description.length < 10) {
    errors.description = "Description must be at least 10 characters";
  } */
  // Url Errors

  if (!values.img) {
    errors.img = "Image required";
  }
  if (!values.title) {
    errors.title = "Title required";
  } else if (values.title.length < 5) {
    errors.title = "Title has to be greater than 5 characaters";
  }

  return errors;
}
