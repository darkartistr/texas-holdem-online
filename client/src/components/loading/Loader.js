import React from 'react';
import spinner from './../../assets/icons/spinning-circles.svg'
import './Loader.scss'

const Loader = () => (
  <>
    <img className="spinner-circles" src={spinner} alt="" />
  </>
);

export default Loader;
