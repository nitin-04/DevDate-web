import axios from "axios";
import { useDispatch, useSelector } from "react-redux"
import { BASE_URL } from "../utils/constants";
import { addfeed } from "../utils/feedSlice";
import { useEffect } from "react";


const Feed = () => {
  const feed = useSelector((store) => store.feed);
  const dispatch = useDispatch();

  const getfeed = async () => {
    if (feed) return;
    try {
      const res = await axios.get(BASE_URL + "/feed", {
        withCredentials: true,
      });
      dispatch(addfeed(res?.data?.data));
    }
    catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    getfeed();
  }, []);

  return (
    <div>

    </div>
  )
}

export default Feed
