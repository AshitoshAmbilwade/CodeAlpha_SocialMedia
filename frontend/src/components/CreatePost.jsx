import React, { useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { readFileAsDataURL } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { useDispatch, useSelector } from 'react-redux';
import { setPosts } from '@/redux/postSlice';

const CreatePost = ({ open, setOpen }) => {
  const imageRef = useRef();
  const [file, setFile] = useState("");
  const [caption, setCaption] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useSelector(store => store.auth);
  const { posts } = useSelector(store => store.post);
  const dispatch = useDispatch();

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFile(file);
      const dataUrl = await readFileAsDataURL(file);
      setImagePreview(dataUrl);
    }
  }

  const createPostHandler = async (e) => {
    const formData = new FormData();
    formData.append("caption", caption);
    if (imagePreview) formData.append("image", file);
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8000/api/v1/post/addpost', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        withCredentials: true
      });
      if (res.data.success) {
        dispatch(setPosts([res.data.post, ...posts]));
        toast.success(res.data.message);
        setOpen(false);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open}>
      <DialogContent className="rounded-lg shadow-lg bg-white" onInteractOutside={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle className='text-center text-lg font-bold text-gray-800'>Create New Post</DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-500 mb-4">
            Share your thoughts and images with your followers!
          </DialogDescription>
        </DialogHeader>
        <div className='flex gap-3 items-center mb-4'>
          <Avatar className='border-2 border-gray-300 rounded-full'>
            <AvatarImage src={user?.profilePicture} alt="Profile" className='rounded-full' />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h1 className='font-semibold text-sm text-gray-800'>{user?.username}</h1>
            <span className='text-gray-600 text-xs'>Bio here...</span>
          </div>
        </div>
        <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} className="focus-visible:ring-transparent border border-gray-300 rounded-md p-2" placeholder="Write a caption..." />
        
        {imagePreview && (
          <div className='w-full h-64 flex items-center justify-center my-4'>
            <img src={imagePreview} alt="Preview" className='object-cover h-full w-full rounded-md shadow-md' />
          </div>
        )}
        
        <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} />
        
        <Button onClick={() => imageRef.current.click()} className='w-full bg-[#0095F6] hover:bg-[#258bcf] rounded-lg text-white py-2'>
          Select from computer
        </Button>
        
        {imagePreview && (
          loading ? (
            <Button className='w-full mt-2 bg-gray-300 text-gray-700'>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Please wait
            </Button>
          ) : (
            <Button onClick={createPostHandler} type="submit" className="w-full mt-2 bg-[#0095F6] hover:bg-[#258bcf] text-white rounded-lg">Post</Button>
          )
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreatePost;
