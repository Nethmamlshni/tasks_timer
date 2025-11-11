import Time from "../../components/time";
import TasksPage from "../../components/task";
import Navbar from "../../components/navbar";
import Footer from "../../components/footer";
export default function Home() {
  return (
    <div className="bg-white ">
      <Navbar />
      <Time />
      <div className="border-t border-gray-300 my-8"></div>
      <TasksPage />
      <Footer />
    </div>
  );
}
