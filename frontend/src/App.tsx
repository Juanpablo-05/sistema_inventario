import CategoryLayout from "./layouts/Category/CategoryLayout";
import { useState } from "react";
import {
  IoClose,
  IoMenu,
  IoBarChart,
  IoCar,
  IoFileTraySharp,
} from "react-icons/io5";

import './layouts/css/side_bar.css'

function App() {

  const [isActive, setIsActive] = useState(false);


  return (
    <div className="container_index">
      <div
        className={
          isActive ? "container_side-bar active" : "container_side-bar"
        }
      >
        <button onClick={() => setIsActive(!isActive) } className="side_bar-btn">
          {isActive ? <IoClose/> : <IoMenu  />}
        </button>
        <div className="side_bar-content">
          <div className="side_bar-category">
            {isActive
              ?            
                <p>categorias</p>
              
              :
              <IoCar color="white" size={26}/>
            }
          </div>
          <div className="side_bar-products">
            { isActive
              ?
                <p>productos</p>            
              :
              <IoFileTraySharp color="white" size={26}/>

            }
          </div>
          <div className="side_bar-movement">
            {isActive
              ?
                <p>movimientos</p>
              :
                <IoBarChart color="white" size={26}/>
            } 
          </div>
        </div>
      </div>
      <CategoryLayout />
    </div>
  );
}

export default App;
