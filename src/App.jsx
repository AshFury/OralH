import React, { useState, useEffect, useRef } from "react";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import Loader from "./components/loader";
import ButtonHandler from "./components/btn-handler";
import { detectImage, detectVideo } from "./utils/detect";
import "./style/App.css";

const App = () => {
  const [loading, setLoading] = useState({ loading: true, progress: 0 }); // loading state
  const [model, setModel] = useState({
    net: null,
    inputShape: [1, 0, 0, 3],
  }); // init model & input shape

  // references
  const imageRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // model configs
  const modelName = "temp";
  const classThreshold = 0.2;

  
  function dis(){
    var dis_class = sessionStorage.getItem('disease_class');
    console.log(dis_class);
  }

  useEffect(() => {
    tf.ready().then(async () => {
      const yolov5 = await tf.loadGraphModel(
        `${window.location.href}/${modelName}/model.json`,
        {
          onProgress: (fractions) => {
            setLoading({ loading: true, progress: fractions }); // set loading fractions
          },
        }
      ); // load model

      // warming up model
      const dummyInput = tf.ones(yolov5.inputs[0].shape);
      const warmupResult = await yolov5.executeAsync(dummyInput);
      tf.dispose(warmupResult); // cleanup memory
      tf.dispose(dummyInput); // cleanup memory

      setLoading({ loading: false, progress: 1 });
      setModel({
        net: yolov5,
        inputShape: yolov5.inputs[0].shape,
      }); // set model & input shape
    });
  }, []);
  return (
    <div className="App">
      {loading.loading && <Loader>Please wait as we load our oral detection module {(loading.progress * 100).toFixed(2)}%</Loader>}
      <div className="header">
        <h1>📷 Oral-H</h1>
        <p>
        Smile Bright, Stay Healthy! Discover Your Oral Health Journey with <code>OralH - Your Personal Oral Hygiene Companion</code>
        </p>
        {/* <p>
          Serving : <code className="code">{modelName}</code>
        </p> */}
      </div>

      <div className="content">
        <img
          src="#"
          ref={imageRef}
          onLoad={() => detectImage(imageRef.current, model, classThreshold, canvasRef.current)}
        />
        <video
          autoPlay
          muted
          ref={cameraRef}
          onPlay={() => detectVideo(cameraRef.current, model, classThreshold, canvasRef.current)}
        />
        <video
          autoPlay
          muted
          ref={videoRef}
          onPlay={() => detectVideo(videoRef.current, model, classThreshold, canvasRef.current)}
        />
        <canvas width={model.inputShape[1]} height={model.inputShape[2]} ref={canvasRef} />
      </div>
      
      <ButtonHandler imageRef={imageRef} cameraRef={cameraRef} videoRef={videoRef} onClick="dis()"/>
      {/* <div id="dis_class" display="none">
        <p>
          You seem to have : ${dis_class}
        </p>
      </div> */}
      <p>
        Need professional advice? Find a doctor near you who can help you....
      </p>
      <p>
        Click below to find clinics near you!!
      </p>
      <a href="report.html">
        <button>Find Clinics</button>
      </a>
    </div>
  );
};


export default App;
