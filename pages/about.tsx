import React, { useRef, useState } from "react";
import Head from "next/head";
import { nanoid } from "nanoid";
import toast, { Toaster } from "react-hot-toast";
import { getSession, withPageAuthRequired } from "@auth0/nextjs-auth0";
import apolloClient from "../backend/utils/apollo";
import {
  useUserImages,
  query as userImagesQuery,
} from "../hooks/useUserImages";
import { CircularProgress } from "@mui/material";
import { useCreateImage } from "../hooks/useCreateImage";
import { dehydrate, QueryClient } from "@tanstack/react-query";
import { useDeleteImage } from "../hooks/useDeleteImage";

const AboutPage = ({ user }) => {
  const { data, isLoading, isError, isFetching } = useUserImages({
    email: user.email,
  });
  const createImageMutation = useCreateImage();
  const deleteImageMutation = useDeleteImage();
  const [formState, setFormState] = useState({
    file: null,
    description: "",
  });

  const inputRef = useRef(null);

  const handleFormChange = e => {
    const { name, value } = e.target;
    setFormState(prevState => ({
      ...prevState,
      [name]: name === "file" ? e.target.files[0] : value,
    }));
  };

  const handleFormSubmit = async e => {
    e.preventDefault();

    const { file, description } = formState;

    if (!file) {
      return toast.error("Please select an image", {
        id: "no-image-error",
      });
    }

    const imageId = nanoid(10);
    const filename = encodeURIComponent(file.name);
    const res = await fetch(`/api/upload-image?file=${imageId + filename}`);
    const data = await res.json();
    const formData = new FormData();

    //@ts-ignore
    Object.entries({ ...data.fields, file }).forEach(([key, value]) => {
      //@ts-ignore
      formData.append(key, value);
    });

    toast.promise(
      fetch(data.url, {
        method: "POST",
        body: formData,
      }),
      {
        loading: "Uploading...",
        success: res => {
          const newImage = {
            url: `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.amazonaws.com/${data.fields.key}`,
            email: user.email,
            description: description ? description : "A random image",
          };

          createImageMutation.mutate(newImage);

          inputRef.current.value = null;
          setFormState({
            file: null,
            description: "",
          });

          return "Image successfully uploaded!🎉 ";
        },
        error: error => {
          console.log(error);
          return "Upload failed 😥 Please try again";
        },
      }
    );
  };

  const handleDeleteImage = async image => {
    try {
      // try to delete image object from S3
      const response = await fetch("/api/delete-image", {
        method: "DELETE",
        body: image.url,
      });

      if (response.status !== 200) {
        throw new Error("Image deletion failed");
      }

      // delete image object from database
      deleteImageMutation.mutate({
        deleteImageId: image.id,
      });
    } catch (error) {
      console.log(error);
      toast.error("Some wrong happened", {
        id: "delete-image-error",
      });
    }
  };

  return (
    <>
      <Toaster />
      <Head>
        <title>About</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <form onSubmit={handleFormSubmit}>
        <div className="relative flex flex-col gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png, image/jpeg"
            name="file"
            onChange={handleFormChange}
          />
          <label htmlFor="image-description">Description</label>
          <input
            id="image-description"
            className="border rounded max-w-md indent-1"
            type="text"
            name="description"
            placeholder="A cute dog..."
            value={formState.description}
            onChange={handleFormChange}
          />
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-28"
            type="submit"
          >
            upload
          </button>
          {true && (
            <div
              className={`transition-all ease-in-out duration-150 border rounded absolute -bottom-1 right-0 w-12 h-12
              flex justify-center items-center bg-slate-50 shadow-sm
              ${isFetching ? "opacity-100" : "opacity-0"}
              `}
            >
              <CircularProgress size={35} />
            </div>
          )}
        </div>
      </form>
      <div className="flex flex-wrap gap-3 mt-2 justify-center">
        {data &&
          data.map(image => (
            <div
              key={image.id}
              className="relative border-2 border-slate-100 rounded-md shadow-md shadow-slate-400/50 transition-all duration-200 hover:scale-105"
            >
              <button
                onClick={() => handleDeleteImage(image)}
                className="absolute right-2 top-2 border rounded bg-slate-100/50 px-4 py-2 hover:shadow-inner hover:bg-slate-100/80"
              >
                Delete
              </button>
              <img
                className="rounded-t-md object-cover border-b w-60 h-60 "
                src={image.url}
                alt={image.description}
              />
              <div className="p-2">
                <p>{image.description}</p>
              </div>
            </div>
          ))}
      </div>
      {isLoading && <div>Loading...</div>}
      {isError && <div>Error</div>}
    </>
  );
};

export const getServerSideProps = withPageAuthRequired({
  async getServerSideProps(context) {
    const user = getSession(context.req, context.res).user;
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery(["userImages"], () =>
      apolloClient
        .query({
          query: userImagesQuery,
          variables: { email: user.email },
        })
        .then(res => res.data.userImages)
    );

    return {
      props: {
        user,
        dehydratedState: dehydrate(queryClient),
      },
    };
  },
});

export default AboutPage;
