import "../pages/css/App.css";

import img1 from "../assets/1.jpg";
import img2 from "../assets/2.jpg";
import img3 from "../assets/3.jpg";
import img4 from "../assets/4.jpg";
import img5 from '../assets/5.jpg';
import img6 from '../assets/6.jpg';
import img7 from '../assets/7.jpg';


function Grid() {
  return (
    <>
      <div className="parent">
        <div className="div1"><img src={img1} alt="" className="grid-img" /></div>
        <div className="div2"><img src={img2} alt="" className="grid-img" /></div>
        <div className="div3"><img src={img3} alt="" className="grid-img" /></div>
        <div className="div4"><img src={img4} alt="" className="grid-img" /></div>
        <div className="div5"><img src={img5} alt="" className="grid-img" /></div>
        <div className="div6"><img src={img6} alt="" className="grid-img" /></div>
        <div className="div7"><img src={img7} alt="" className="grid-img" /></div>
      </div>
    </>
  );
}

export default Grid;
