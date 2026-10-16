import { redirect } from "next/navigation";

const Home = () => {
  redirect("/books");
};

export default Home;
