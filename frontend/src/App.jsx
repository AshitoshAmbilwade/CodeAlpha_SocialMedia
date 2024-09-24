import Signup from './components/Signup'
import Signin from './components/Signin'
import { createBrowserRouter,RouterProvider } from 'react-router-dom'
import MainLayout from './components/MainLayout'
import Home from './components/Home'

const browserRouter =createBrowserRouter([
  {
    path:"/",
    element:<MainLayout/>,
    children:[
      {
        path:"/",
        element:<Home/>
      }
    ]
  },
  {
    path:'/login',
    element:<Signin/>
  },
  {
    path:'/register',
    element:<Signup/>
  }
])

function App() {
  return (
    <>
    <RouterProvider router={browserRouter}/>
    </>
  )
}

export default App
