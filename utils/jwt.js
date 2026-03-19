import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const id = user?._id || user?.id || user?.userId;
  const mobile = user?.mobile || user?.phone;

  return jwt.sign(
    { id, mobile },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};
