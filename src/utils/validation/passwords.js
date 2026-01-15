const yup = require("yup");


exports.CreatePasswordSchema = yup.object().shape({
  website: yup.string().required("Website is required"),
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
});

exports.UpdatePasswordSchema = yup.object().shape({
  website: yup.string().required("Website is required"),
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
  ID: yup.string().required("ID is required"),
});

exports.DeletePasswordSchema = yup.object().shape({
  ID: yup.string().required("ID is required"),
});