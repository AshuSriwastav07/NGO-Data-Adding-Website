import Footer from "./components/Footer"
import Body from "./components/Body"
import Header from "./components/Header"
import Main from "./components/main"

function App() {

  return (
    
    <>
    
      <Header/>
      <div className="bg-amber-200 max-h-max max-w-full 2xl:w-screen 2xl:h-screen">
        <Body/>
        <Footer/>
        <Main/>
      </div>
    </>
  )
}

export default App
