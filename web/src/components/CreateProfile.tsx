import { gql, useMutation } from "@apollo/client";
import React, { useRef, useState } from "react";
import { ME_QUERY } from "../pages/Profile";
import { ErrorMessage, Field, Form, Formik, yupToFormErrors } from "formik";
import Modal from "react-modal";
import { customStyles } from "../styles/CustomModalStyles";

const CREATE_PROFILE_MUTATION = gql`
  mutation createProfile(
    $bio: String
    $location: String
    $website: String
    $avatar: String
  ) {
    createProfile(
      bio: $bio
      location: $location
      website: $website
      avatar: $avatar
    ) {
      id
    }
  }
`;
interface ProfileValues {
  bio: string;
  location: string;
  website: string;
  avatar: string;
}

function CreateProfile() {
  const inputFile = useRef<HTMLInputElement | null>(null);
  const [image, setImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [createProfile] = useMutation(CREATE_PROFILE_MUTATION, {
    refetchQueries: [{ query: ME_QUERY }],
  });
  const [modalIsOpen, setIsOpen] = useState(false);

  const initialValues: ProfileValues = {
    bio: "",
    location: "",
    website: "",
    avatar: "",
  };
  const openModal = () => {
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setImageLoading(true);
    const data = new FormData();
    data.append("file", files[0]);
    data.append("upload_preset", "twitter-clone");
    const res = await fetch(process.env.REACT_APP_CLOUDINARY_ENDPOINT, {
      method: "POST",
      body: data,
    });
    const file = await res.json();
    setImage(file.secure_url);
    console.log(file.secure_url);
    setImageLoading(false);
  };

  return (
    <div>
      <button onClick={openModal} className="edit-button">
        Create Profile
      </button>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Modal"
        style={customStyles}
      >
        <input
          type="file"
          name="file"
          placeholder="Upload an image"
          onChange={uploadImage}
          ref={inputFile}
          style={{ display: "none" }}
        />
        {imageLoading ? (
          <h3>Loading...</h3>
        ) : (
          <>
            {image ? (
              <span onClick={() => inputFile.current.click()}>
                <img
                  src={image}
                  style={{ width: "150px", borderRadius: "50%" }}
                  alt="avatar"
                  onClick={() => inputFile.current.click()}
                />
              </span>
            ) : (
              <span onClick={() => inputFile.current.click()}>
                <i
                  className="fa fa-user fa-5x"
                  aria-hidden="true"
                  onClick={() => inputFile.current.click()}
                ></i>
              </span>
            )}
          </>
        )}
        <Formik
          initialValues={initialValues}
          //validationSchema={validationSchema}
          onSubmit={async (values, { setSubmitting }) => {
            setSubmitting(true);
            await createProfile({
              variables: { ...values, avatar: image },
            });
            setSubmitting(false);
            setIsOpen(false);
          }}
        >
          <Form>
            <Field name="bio" type="text" as="textarea" placeholder="Bio" />
            <ErrorMessage name="bio" component={"div"} />
            <Field name="location" type="location" placeholder="Location" />
            <ErrorMessage name="location" component={"div"} />
            <Field name="website" type="website" placeholder="Website" />
            <ErrorMessage name="website" component={"div"} />

            <button type="submit" className="login-button">
              <span>Create Profile</span>
            </button>
          </Form>
        </Formik>
      </Modal>
    </div>
  );
}

export default CreateProfile;
