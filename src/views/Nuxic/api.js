import axios from "axios";

const request = axios.create({
  baseURL: "/nuxic",
});

export const getPlaylist = async (id) => {
  let playlist = [];
  if (id !== undefined) {
    playlist[0] = (await request(`/playlist/${id}`)).data;
  } else {
    playlist = (await request("/playlist")).data;
  }
  for (const item of playlist) {
    item.cover = `http://127.0.0.1:3000/api/file/${item.coverId}`;
    item.coverSize = {
      s: item.cover,
      m: item.cover,
      l: item.cover,
      xl: item.cover,
    };
    item.count = item.songIds.length;
    item.creator = "";
    item.createTime = "1656573893700";
    item.userId = "3937312537";
    item.description = item.desc;
    item.desc = undefined;
  }
  return playlist;
};

export const getArtist = async () => {
  const { data: artist } = await request("/artist");
  for (const item of artist) {
    item.cover = `http://127.0.0.1:3000/api/file/${item.avatarId}`;
    item.coverSize = {
      s: item.cover,
      m: item.cover,
      l: item.cover,
      xl: item.cover,
    };
    item.description = item.desc;
    item.alias = [];
    item.size = {
      music: item.song.length,
      album: 0,
      mv: null,
      fans: 0,
    };
    item.desc = undefined;
  }
  return artist;
};
