import React, { useState, useEffect } from 'react';
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from './ui/button';
import axios from 'axios';
import { toast } from 'sonner';
import { Link, useNavigate } from 'react-router-dom';
import { Loader2 } from "lucide-react";
import zxcvbn from 'zxcvbn';

function Signup() {
  const [input, setInput] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [usernameAvailable, setUsernameAvailable] = useState(null); 
  const [passwordStrength, setPasswordStrength] = useState(null); 
  const navigate = useNavigate();

  useEffect(() => {
    if (input.password) {
      const strength = zxcvbn(input.password);
      setPasswordStrength(strength);
    }
  }, [input.password]);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });

    if (e.target.name === 'username') {
      checkUsernameAvailability(e.target.value);
    }
  };

  const checkUsernameAvailability = async (username) => {
    if (username) {
      try {
        const res = await axios.post('http://localhost:8000/api/v1/user/register', { username });
        setUsernameAvailable(res.data.available);
      } catch (error) {
        console.error('Error checking username availability:', error);
        setUsernameAvailable(null);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword); 
  };

  const signupHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await axios.post('http://localhost:8000/api/v1/user/register', input, {
        headers: {
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/login");
        setInput({
          username: "",
          email: "",
          password: ""
        });
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen w-screen p-4">
      <form onSubmit={signupHandler} className="w-full max-w-sm md:max-w-md lg:max-w-lg p-6 bg-white shadow-lg rounded-lg flex flex-col gap-5">
        <div className="my-4 text-center">
          <h1 className="font-bold text-2xl">LOGO</h1>
          <p className="text-sm">Join the community. Share your moments, connect with friends.</p>
        </div>

        <div>
          <Label className="font-bold">
            Username <span className="text-red-500">*</span>
          </Label>
          <Input
            type="text"
            name="username"
            value={input.username}
            onChange={changeEventHandler}
            className="w-full mt-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter unique username"
            required
          />
          {usernameAvailable === null ? null : (
            <span className={`text-sm ${usernameAvailable ? 'text-green-500' : 'text-red-500'}`}>
              {usernameAvailable ? 'Username is available' : 'Username is taken'}
            </span>
          )}
        </div>

        <div>
          <Label className="font-bold">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            type="email"
            name="email"
            value={input.email}
            onChange={changeEventHandler}
            className="w-full mt-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            required
          />
        </div>

        <div className="relative">
          <Label className="font-bold">
            Set Password <span className="text-red-500">*</span>
          </Label>
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            value={input.password}
            onChange={changeEventHandler}
            className="w-full mt-2 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Set a strong password"
            required
          />
          <div
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 right-3 top-10 cursor-pointer"
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                <path d="M12 19c.946 0 1.81-.103 2.598-.281l-1.757-1.757c-.273.021-.55.038-.841.038-5.351 0-7.424-3.846-7.926-5a8.642 8.642 0 0 1 1.508-2.297L4.184 8.305c-1.538 1.667-2.121 3.346-2.132 3.379a.994.994 0 0 0 0 .633C2.073 12.383 4.367 19 12 19zm0-14c-1.837 0-3.346.396-4.604.981L3.707 2.293 2.293 3.707l18 18 1.414-1.414-3.319-3.319c2.614-1.951 3.547-4.615 3.561-4.657a.994.994 0 0 0 0-.633C21.927 11.617 19.633 5 12 5zm4.972 10.558-2.28-2.28c.19-.39.308-.819.308-1.278 0-1.641-1.359-3-3-3-.459 0-.888.118-1.277.309L8.915 7.501A9.26 9.26 0 0 1 12 7c5.351 0 7.424 3.846 7.926 5-.302.692-1.166 2.342-2.954 3.558z"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor">
                <path d="M12 9a3.02 3.02 0 0 0-3 3c0 1.642 1.358 3 3 3 1.641 0 3-1.358 3-3 0-1.641-1.359-3-3-3z"></path>
                <path d="M12 5c-7.633 0-9.927 6.617-9.948 6.684L1.946 12l.105.316C2.073 12.383 4.367 19 12 19s9.927-6.617 9.948-6.684l.106-.316-.105-.316C21.927 11.617 19.633 5 12 5zm0 12c-5.351 0-7.424-3.846-7.926-5C4.578 10.842 6.652 7 12 7c5.351 0 7.424 3.846 7.926 5-.504 1.158-2.578 5-7.926 5z"></path>
              </svg>
            )}
          </div>
        </div>

        {passwordStrength && (
          <div className="my-2">
            <p>Password Strength: {["Very Weak", "Weak", "Fair", "Good", "Strong"][passwordStrength.score]}</p>
            <div className="w-full bg-gray-200 h-2 rounded">
              <div className={`h-2 rounded ${['bg-red-500', 'bg-orange-400', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500'][passwordStrength.score]}`} style={{ width: `${(passwordStrength.score + 1) * 20}%` }}></div>
            </div>
          </div>
        )}

        <Button type="submit" disabled={loading}  >
          {loading ? <Loader2 className="animate-spin" /> : "Sign Up"}
        </Button>

        <div className="my-2 text-center">
          <p className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-blue-500 hover:underline">Login</Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default Signup;
