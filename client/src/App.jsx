import React, { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './pages/auth';
import Profile from './pages/profile';
import Chat from './pages/chat';
import { useAppStore } from './store';
import { apiClient } from './lib/api-client';
import { GET_USER_INFO } from './utils/constants';
import Lottie from 'react-lottie';
import { animationDefaultOptions } from './lib/utils';

const PrivateRoute = ({children}) => {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? children : <Navigate to="/auth" />
}

const AuthRoute = ({children}) => {
  const {userInfo} = useAppStore();
  const isAuthenticated = !!userInfo;
  return isAuthenticated ? <Navigate to="/chat" /> : children;
}

const App = () => {

  const {userInfo, setUserInfo} = useAppStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await apiClient.get(GET_USER_INFO, {
          withCredentials: true,
        });
        if(response.status === 200 && response.data.id){
          setUserInfo(response.data);
        } else {
          setUserInfo(undefined);
        }
      } catch (error) {
        setUserInfo(undefined);
      } finally {
        setLoading(false);
      }
    };
    if(!userInfo){
      getUserData();
    } else {
      setLoading(false);
    }
  }, [userInfo, setUserInfo]);

  if(loading) {
    return (
      <div className="bg-[#1c1d25] w-[100vw] flex flex-col items-center justify-center h-[100vh] duration-1000 transition-all">
            <div className='w-52 h-52 md:w-72 md:h-72'>
              <Lottie
                  isClickToPauseDisabled={true}
                  height="100%"
                  width="100%"
                  options={animationDefaultOptions}
              />
            </div>
            <div className="text-white flex flex-col gap-5 items-center lg:text-4xl text-3xl transition-all duration-300 text-center">
                <h3 className="poppins-medium">
                    Loading..
                </h3>
            </div>
        </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes> 
        <Route path="/auth" element={<AuthRoute><Auth /></AuthRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Chat /></PrivateRoute>} />
        
        <Route path="*" element={<Navigate to="/auth" />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;