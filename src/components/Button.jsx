import React from "react";
import { Link } from "react-router-dom";
import "./Button.css";

const Button = ({ to, onClick, type = "button", children, variant = "primary" }) => {
  const className = `btn btn-${variant}`;

  return to ? (
    <Link to={to} className={className}>
      {children}
    </Link>
  ) : (
    <button type={type} onClick={onClick} className={className}>
      {children}
    </button>
  );
};

export default Button;