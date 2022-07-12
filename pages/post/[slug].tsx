import React, { useState } from 'react';
import {sanityClient, urlPar} from "../../sanity";
import Header from '../../components/Header';
import { Post } from '../../typings';
import { GetStaticProps } from 'next';
import PortableText from "react-portable-text";
import { useForm, SubmitHandler } from "react-hook-form";

interface Props {
    post: Post;
}

interface InputForm {
    _id: string;
    name: string;
    email: string;
    comment: string;
}

function Post({post}: Props) {
  const [submit, setSumbit] = useState(false);
  const { handleSubmit, register, formState: {errors}} = useForm<InputForm>();
  const onSubmit: SubmitHandler<InputForm> = async(data) => {
    await fetch('/api/createComment', {
        method: "POST",
        body: JSON.stringify(data),
    }).then(() => {
        setSumbit(true);
    }).catch((err) => {
        setSumbit(false);
    });
  }

  return (
    <main>
        <Header />
        <img className='w-full object-cover h-40' src={urlPar(post.mainImage).url()} alt="" />
        <article className='max-w-3xl mx-auto p-5'>
            <h1 className='text-3xl mt-10 mb-3'>{post.title}</h1>
            <h2 className='text-xl font-light text-gray-500'>{post.description}</h2>
            <div className='flex items-center space-x-2'>
                <img className="h-10 w-10 rounded-full" src={urlPar(post.author.image).url()} alt="" />
                <p className='font-extralight text-sm'>post by <span className='text-green-600'>{post.author.name}</span> - Published at {new Date(post._createdAt).toLocaleString()}</p>
            </div>
            <div className='mt-10'>
                <PortableText 
                className=''
                dataset={process.env.NEXT_PUBLIC_SANITY_DATASET}
                projectId={process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}
                content={post.body}
                serializers={
                    {
                        h1: (props: any) => (
                            <h1 className='text-2xl font-bold my-3' {...props}/>
                        ),
                        h2: (props: any) => (
                            <h2 className='text-xl font-bold my-5' {...props}/>
                        ),
                        li: ({children}: any) => (
                            <li className='xl-4 list-disc'>{children}</li>
                        ),
                        link: ({href, children}: any) => (
                            <a href={href} className='text-blue-500 hover:underline'>{children}</a>
                        ),
                    }
                }
                />
            </div>
        </article>
        <hr className='max-w-lg my-5 mx-auto border border-yellow-500'/>
        {submit ? (
        <div className='flex flex-col p-10 my-10 bg-yellow-500 text-white mx-auto max-w-2xl'>
            <h3 className='text-3xl font-bold'>Thank you for submitting</h3>
            <p>Once it's been approved it will appear below</p>
        </div>) : 
        (<form onSubmit={handleSubmit(onSubmit)} className='flex flex-col p-5 max-w-2xl mx-auto mb-10'>
            <input {...register("_id")} type="hidden" name='_id' value={post._id} />
            <h3 className="text-sm text-yellow-500">Enjoyed this article</h3>
            <h4 className="text-3xl font-bold">Leave a comment below!</h4>
            <hr className="py-3 mt-2" />
            <label className='black mb-5'>
                <span className='text-gray-700'>Name</span>
                <input {...register("name", { required: true})} className='shadow border rounded py-2 px-3 form-input block w-full ring-yellow-500 outline-none focus:ring' placeholder='John Appleseed' type="text" />
            </label>
            <label className='black mb-5'>
                <span className='text-gray-700'>Email</span>
                <input {...register("email", { required: true})} className='shadow border rounded py-2 px-3 form-input block w-full ring-yellow-500 outline-none focus:ring' placeholder='John Appleseed' type="email" />
            </label>
            <label className='black mb-5'>
                <span className='text-gray-700'>Comment</span>
                <textarea {...register("comment", { required: true})} className='shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring' placeholder='John Appleseed' rows={8}></textarea>
            </label>
            <div className='flex flex-col p-5'>
                {errors.name && (
                    <span className="text-red-500">The name field is required</span>
                )}
                {errors.comment && (
                    <span className="text-red-500">The comment field is required</span>
                )}
                {errors.email && (
                    <span className="text-red-500">The email field is required</span>
                )}
            </div>
            <input type="submit" className='bg-yellow-500 hover:bg-yellow-600 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer' />
        </form>)}
        <div className='flex flex-col p-10 my-10 max-w-2xl shadow-yellow-500 '>
            <h3 className='text-4xl'>Comments</h3>
            <hr className='pb-2'/>
            {post.comments.map((comment) => (
                <div key={comment._id}>
                    <p><span className='text-yellow-500'>{comment.name}: </span>{comment.comment}</p>
                </div>
            ))}
        </div>
    </main>
  )
}

export default Post;

export const getStaticPaths =async () => {
    const query = `*[_type == 'post']{
        _id,
        slug,
      }`;
    const posts = await sanityClient.fetch(query);
    const paths = posts.map((post: Post) => ({
        params: {
            slug: post.slug.current
        }
    }))
    return {
        paths, 
        fallback: "blocking",
    }
}

export const getStaticProps: GetStaticProps = async ({params}) => {
    const query = `*[_type == 'post'&& slug.current == $slug][0]{
        _id,
        _createdAt,
        title,
        author -> {
        name,
        image,
        },
        "comments": *[
            _type == 'comment' &&
            post._ref == ^._id &&
            approved == true
        ],
        description, 
        mainImage,
        slug,
        body,
    }`
    const post = await sanityClient.fetch(query, {
        slug: params?.slug,
    })
    if (!post) {
        return{
            notFound: true
        }
    }
    return {
        props: {
            post,
        },
        revalidate: 86400, //updates the old cache everyday
    }
}

