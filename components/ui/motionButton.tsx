import { motion } from "framer-motion";
import { Button, ButtonProps } from "./button"; // Assuming the existing button component is in the same directory

const MotionButton = motion<ButtonProps>(Button);

export default MotionButton;
