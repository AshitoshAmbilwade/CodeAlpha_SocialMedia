import React, { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import useGetUserProfile from '@/hooks/useGetUserProfile';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { AtSign, Heart, MessageCircle } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const Profile = () => {
  const params = useParams();
  const userId = params.id;
  useGetUserProfile(userId);
  
  const [activeTab, setActiveTab] = useState('posts');
  const [isFollowing, setIsFollowing] = useState(false);
  const { userProfile, user } = useSelector(store => store.auth);

  const isLoggedInUserProfile = user?._id === userProfile?._id;

  useEffect(() => {
    if (userProfile?.followers?.includes(user?._id)) {
      setIsFollowing(true);
    }
  }, [userProfile, user]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleFollowUnfollow = async () => {
    try {
      const response = await axios.post(`http://localhost:8000/api/v1/user/followorunfollow/${userProfile?._id}`, {}, {
        withCredentials: true, // Send cookies with the request
      });

      if (response.data.success) {
        setIsFollowing((prev) => !prev);
        toast(response.data.message)
      } else {
        console.error(response.data.message);
      }
    } catch (error) {
      console.error("Error while following/unfollowing:", error.response?.data?.message || error.message);
    }
  };

  const displayedPost = activeTab === 'posts' ? userProfile?.posts || [] : userProfile?.bookmarks || [];

  return (
    <div className='flex max-w-5xl justify-center mx-auto pl-10'>
      <div className='flex flex-col gap-20 p-8'>
        <div className='grid grid-cols-2'>
          <section className='flex items-center justify-center'>
            <Avatar className='h-32 w-32'>
              <AvatarImage src={userProfile?.profilePicture} alt="profilephoto" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          </section>
          <section>
            <div className='flex flex-col gap-5'>
              <div className='flex items-center gap-2'>
                <span>{userProfile?.username}</span>
                {isLoggedInUserProfile ? (
                  <>
                    <Link to="/account/edit">
                      <Button variant='secondary' className='hover:bg-gray-200 h-8'>Edit profile</Button>
                    </Link>
                    <Button variant='secondary' className='hover:bg-gray-200 h-8'>View archive</Button>
                    <Button variant='secondary' className='hover:bg-gray-200 h-8'>Ad tools</Button>
                  </>
                ) : (
                  isFollowing ? (
                    <>
                      <Button variant='secondary' className='h-8' onClick={handleFollowUnfollow}>Unfollow</Button>
                      <Button variant='secondary' className='h-8'>Message</Button>
                    </>
                  ) : (
                    <Button className='bg-[#0095F6] hover:bg-[#3192d2] h-8' onClick={handleFollowUnfollow}>Follow</Button>
                  )
                )}
              </div>
              <div className='flex items-center gap-4'>
                <p><span className='font-semibold'>{userProfile?.posts?.length || 0} </span>posts</p>
                <p><span className='font-semibold'>{userProfile?.followers?.length || 0} </span>followers</p>
                <p><span className='font-semibold'>{userProfile?.following?.length || 0} </span>following</p>
              </div>
              <div className='flex flex-col gap-1'>
                <span className='font-semibold'>{userProfile?.bio || 'bio here...'}</span>
                <Badge className='w-fit' variant='secondary'><AtSign /> <span className='pl-1'>{userProfile?.username}</span></Badge>
              </div>
            </div>
          </section>
        </div>
        <div className='border-t border-t-gray-200'>
          <div className='flex items-center justify-center gap-10 text-sm'>
            <span className={`py-3 cursor-pointer ${activeTab === 'posts' ? 'font-bold' : ''}`} onClick={() => handleTabChange('posts')}>
              POSTS
            </span>
            <span className={`py-3 cursor-pointer ${activeTab === 'saved' ? 'font-bold' : ''}`} onClick={() => handleTabChange('saved')}>
              SAVED
            </span>
            <span className='py-3 cursor-pointer'>REELS</span>
            <span className='py-3 cursor-pointer'>TAGS</span>
          </div>
          <div className='grid grid-cols-3 gap-1'>
            {displayedPost.map((post) => {
              return (
                <div key={post?._id} className='relative group cursor-pointer'>
                  <img src={post.image} alt='postimage' className='rounded-sm my-2 w-full aspect-square object-cover' />
                  <div className='absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300'>
                    <div className='flex items-center space-x-4'>
                      <button className='flex items-center gap-1 bg-transparent hover:text-red-800'>
                        <Heart />
                        <span>{post?.likes.length}</span>
                      </button>
                      <button className='flex items-center gap-1 bg-transparent hover:text-gray-100'>
                        <MessageCircle />
                        <span>{post?.comments.length}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
