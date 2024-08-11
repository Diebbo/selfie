import * as yup from "yup";

export const LoginSchema = yup.object().shape({
  email: yup
    .string()
    .email("This field must be an email")
    .required("Email is required"),
  password: yup.string().required("Password is required"),
});

export const RegisterSchema = yup.object().shape({
  username: yup.string().required("Username is required"),
  password: yup.string().required("Password is required"),
  confirmPassword: yup
    .string()
    .required("Confirm password is required")
    .oneOf([yup.ref("password")], "Passwords must match"),
  name: yup.string().required("Name is required"),
  surname: yup.string().required("Surname is required"),
  email: yup
    .string()
    .email("This field must be an email")
    .required("Email is required"),
  birthDate: yup.date().required("Birth date is required").nullable(), // Ensure it can handle Date type correctly
  phoneNumber: yup.string().optional(),
  address: yup.string().required("Address is required"),
  city: yup.string().required("City is required"),
  state: yup.string().required("State is required"),
  zip: yup.string().required("ZIP code is required"),
  country: yup.string().required("Country is required"),
});
