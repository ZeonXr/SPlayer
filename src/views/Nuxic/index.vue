<!-- 首页 -->
<template>
  <div class="home">
    <!-- 欢迎 -->
    <div class="greetings">
      <n-h1 class="welcome">
        {{ getGreetings() }}
      </n-h1>
      <n-text depth="3">由此开启好心情 ~</n-text>
    </div>
    <div v-for="(item, index) in recommendData" :key="index" class="rec-public">
      <n-h3 class="title" prefix="bar">
        <n-text class="name">{{ item.name }}</n-text>
        <n-icon v-if="item.to" class="more" depth="3">
          <SvgIcon icon="chevron-right" />
        </n-icon>
      </n-h3>
      <MainCover
        :data="item.data"
        :type="item.type"
        :loadingNum="item.loadingNum"
        :columns="item.columns"
      />
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from "pinia";
import { getGreetings } from "@/utils/timeTools";
import { siteData, siteSettings } from "@/stores";
import { isLogin } from "@/utils/auth";
import MainCover from "./MainCover.vue";

import { getPlaylist, getArtist } from "./api";

const data = siteData();
const settings = siteSettings();
const { showSider } = storeToRefs(settings);

// 个性化推荐数据
const recommendData = ref({
  playlist: {
    name: isLogin() ? "专属歌单" : "推荐歌单",
    loadingNum: 12,
    columns: showSider.value ? undefined : "2 s:3 m:4 l:5 xl:6",
    data: [],
    type: "playlist",
    to: "/nuxic-playlist",
  },

  artist: {
    name: "歌手推荐",
    type: "artist",
    columns: showSider.value ? "3 s:4 m:5 l:6" : "3 sm:4 m:5 l:6",
    loadingNum: 6,
    data: [],
    to: "/nuxic-artist",
  },

  // album: {
  //   name: "新碟上架",
  //   type: "album",
  //   loadingNum: 12,
  //   data: [],
  //   to: "/discover/new",
  // },
});

// 获取个性化推荐数据
const getRecommendData = async () => {
  try {
    // const [playlistRes, artistRes, albumRes] = await Promise.allSettled([
    //   // 歌单
    //   getCacheData("recPl-P", 5, getDailyRec, "resource"),
    //   getCacheData("recAr", 5, getTopArtists),
    //   getCacheData("recAl", 5, getNewAlbum),
    // ]);
    // console.log(playlistRes, artistRes, albumRes);
    // // 检查请求状态
    // playlistRes.status === "fulfilled" &&
    //   (recommendData.value.playlist.data = formatData(
    //     isLogin()
    //       ? playlistRes.value.recommend.filter((playlist) => {
    //           return !playlist.name.includes("私人雷达");
    //         })
    //       : playlistRes.value.result,
    //   ));
    // artistRes.status === "fulfilled" &&
    //   (recommendData.value.artist.data = formatData(artistRes.value.artists, "artist"));

    // albumRes.status === "fulfilled" &&
    //   (recommendData.value.album.data = formatData(albumRes.value.albums, "album"));
    // // 检查是否有任何请求失败
    // const anyRejected = [playlistRes, artistRes, albumRes].some((res) => res.status === "rejected");
    // if (anyRejected) {
    //   throw new Error("一个或多个请求失败");
    // }
    recommendData.value.playlist.data = await getPlaylist();
    recommendData.value.artist.data = (await getArtist()).slice(0, 10);
  } catch (error) {
    $message.error("个性化推荐获取失败");
    console.error("个性化推荐获取失败：", error);
  }
};

onBeforeMount(async () => {
  // 每日推荐
  data.setDailySongsData();
  // 个性化推荐
  getRecommendData();
  console.log("---------------------------------------------");
  console.log(await getArtist());
  console.log("---------------------------------------------");
});
</script>

<style lang="scss" scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
  .greetings {
    margin-bottom: 20px;
    .welcome {
      margin: 0;
      font-weight: bold;
    }
  }
  .title {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-left: 2px;
    margin-top: 28px;
    padding-left: 16px;
    cursor: pointer;
    .more {
      font-size: 26px;
      opacity: 0;
      transform: translateX(4px);
      transition:
        opacity 0.3s,
        transform 0.3s;
    }
    &:hover {
      .more {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
  .rec-private {
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    .rec-fm {
      width: 100%;
      height: 220px;
      margin-left: 20px;
      max-width: calc(50% - 10px);
    }
    @media (max-width: 700px) {
      flex-direction: column;
      .rec-fm {
        margin-left: 0;
        margin-top: 20px;
        max-width: 100%;
      }
    }
  }
}
</style>
