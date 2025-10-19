import React from "react";
import Introduction from "./components/Introduction";

interface HomeProps {}

const Home: React.FC<HomeProps> = () => {
  return (
    <div>
      <Introduction />
    </div>
  );
};

export default Home;
