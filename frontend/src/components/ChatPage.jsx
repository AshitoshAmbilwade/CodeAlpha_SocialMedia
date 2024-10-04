import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { setSelectedUser } from '@/redux/authSlice';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { MessageCircleCode, Send } from 'lucide-react'; // Send Icon
import Messages from './Messages';
import axios from 'axios';
import { setMessages } from '@/redux/chatSlice';

const ChatPage = () => {
    const [textMessage, setTextMessage] = useState("");
    const { user, suggestedUsers, selectedUser } = useSelector(store => store.auth);
    const { onlineUsers, messages } = useSelector(store => store.chat);
    const dispatch = useDispatch();

    const sendMessageHandler = async (receiverId) => {
        try {
            const res = await axios.post(`http://localhost:8000/api/v1/message/send/${receiverId}`, { textMessage }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });
            if (res.data.success) {
                dispatch(setMessages([...messages, res.data.newMessage]));
                setTextMessage("");
            }
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        return () => {
            dispatch(setSelectedUser(null));
        }
    },[]);

    return (
        <div className='flex h-screen ml-[16%] bg-gray-50'>
            {/* Left Sidebar (User List) */}
            <section className='w-full md:w-1/4 p-6 bg-white shadow-lg'>
                <h1 className='font-bold mb-4 text-lg text-gray-800'>{user?.username}</h1>
                <hr className='mb-4 border-gray-300' />
                <div className='overflow-y-auto h-[80vh]'>
                    {
                        suggestedUsers.map((suggestedUser) => {
                            const isOnline = onlineUsers.includes(suggestedUser?._id);
                            return (
                                <div 
                                    onClick={() => dispatch(setSelectedUser(suggestedUser))} 
                                    className='flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer rounded-lg transition-all'
                                >
                                    <Avatar className='w-12 h-12'>
                                        <AvatarImage src={suggestedUser?.profilePicture} />
                                        <AvatarFallback>CN</AvatarFallback>
                                    </Avatar>
                                    <div className='flex flex-col'>
                                        <span className='font-medium text-gray-900'>{suggestedUser?.username}</span>
                                        <div className='flex items-center gap-2'>
                                            <span className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
                                            <span className='text-sm text-gray-500'>{isOnline ? 'online' : 'offline'}</span>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </section>

            {/* Main Chat Section */}
            {
                selectedUser ? (
                    <section className='flex-1 border-l border-l-gray-300 flex flex-col h-full bg-white'>
                        {/* Chat Header */}
                        <div className='flex gap-3 items-center px-4 py-3 border-b border-gray-300 sticky top-0 bg-white shadow z-10'>
                            <Avatar className='w-10 h-10'>
                                <AvatarImage src={selectedUser?.profilePicture} alt='profile' />
                                <AvatarFallback>CN</AvatarFallback>
                            </Avatar>
                            <div className='flex flex-col'>
                                <span className='text-lg font-medium text-gray-800'>{selectedUser?.username}</span>
                            </div>
                        </div>

                        {/* Messages Section */}
                        <div className='flex-1 overflow-y-auto p-4'>
                            <Messages selectedUser={selectedUser} />
                        </div>

                        {/* Message Input */}
                        <div className='flex items-center p-4 bg-gray-50 border-t border-gray-300'>
                            <Input 
                                value={textMessage} 
                                onChange={(e) => setTextMessage(e.target.value)} 
                                type="text" 
                                className='flex-1 px-4 py-2 rounded-full shadow-sm text-sm border border-gray-300 focus:border-blue-400' 
                                placeholder="Type a message..." 
                            />
                            <Button 
                                onClick={() => sendMessageHandler(selectedUser?._id)} 
                                className='ml-2 bg-transparent hover:bg-blue-50 focus:outline-none'
                            >
                                <Send className="w-6 h-6 text-blue-500" />
                            </Button>
                        </div>
                    </section>
                ) : (
                    <div className='flex flex-col items-center justify-center mx-auto'>
                        <MessageCircleCode className='w-32 h-32 my-4 text-gray-400' />
                        <h1 className='font-medium text-lg text-gray-600'>Your messages</h1>
                        <span className='text-gray-500'>Send a message to start a chat.</span>
                    </div>
                )
            }
        </div>
    )
}

export default ChatPage;
