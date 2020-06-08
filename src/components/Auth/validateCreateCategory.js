export default function validateCreateLink(values) {
  let errors = {};

  // Url Errors
  if (!values.title) {
    errors.title = "Title required";
  } else if (values.title.length < 5) {
    errors.title = "Title has to be greater than 5 characaters";
  }

  return errors;
}
