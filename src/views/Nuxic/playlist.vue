<!-- 歌单页面 -->
<template>
  <div v-if="playlistId" class="playlist">
    <Transition name="fade" mode="out-in">
      <div v-if="playListDetail && Object.keys(playListDetail)?.length" class="detail">
        <div class="cover">
          <!-- 封面 -->
          <n-image
            :src="playListDetail.coverSize.l"
            :previewed-img-props="{ style: { borderRadius: '8px' } }"
            :preview-src="playListDetail.cover"
            class="cover-img"
            show-toolbar-tooltip
            @load="
              (e) => {
                e.target.style.opacity = 1;
              }
            "
          >
            <template #placeholder>
              <div class="cover-loading">
                <img class="loading-img" src="/images/pic/song.jpg?assest" alt="song" />
              </div>
            </template>
          </n-image>
          <!-- 封面背板 -->
          <n-image :src="playListDetail.coverSize.m" class="cover-shadow" preview-disabled />
        </div>
        <div class="data">
          <n-text class="name">
            {{
              userLikeData.playlists?.[0]?.id === playlistId
                ? "我喜欢的音乐"
                : playListDetail.name || "未知歌单"
            }}
          </n-text>
          <div class="creator">
            <n-avatar
              :src="
                (playListDetail.creator?.avatarUrl + '?param=300y$300').replace(/^http:/, 'https:')
              "
              fallback-src="/images/pic/avatar.jpg?assest"
              round
            />
            <n-text class="nickname">{{ playListDetail.creator?.nickname || "未知创建者" }}</n-text>
            <n-text v-if="playListDetail.createTime" class="create-time" depth="3">
              {{ getTimestampTime(playListDetail.createTime) }} 创建
            </n-text>
          </div>
          <!-- 标签 -->
          <n-flex v-if="playListDetail?.tags" class="tags">
            <n-tag
              v-for="(item, index) in playListDetail.tags"
              :key="index"
              :bordered="false"
              class="pl-tags"
              round
              @click="
                router.push({
                  path: '/discover/playlists',
                  query: { cat: item },
                })
              "
            >
              {{ item }}
            </n-tag>
          </n-flex>
          <!-- 数量 -->
          <n-flex class="num">
            <div v-if="playListDetail.count" class="num-item">
              <n-icon depth="3" size="18">
                <SvgIcon icon="music-note" />
              </n-icon>
              <n-text depth="3">{{ playListDetail.count }}</n-text>
            </div>
            <div v-if="playListDetail.playCount" class="num-item">
              <n-icon depth="3" size="18">
                <SvgIcon icon="headphones" />
              </n-icon>
              <n-text depth="3">{{ formatNumber(playListDetail?.playCount || 0) }}</n-text>
            </div>
            <div v-if="playListDetail.updateTime" class="num-item">
              <n-icon depth="3" size="18">
                <SvgIcon icon="update-rounded" />
              </n-icon>
              <n-text depth="3">{{ getTimestampTime(playListDetail.updateTime) }}</n-text>
            </div>
          </n-flex>
          <!-- 简介 -->
          <n-ellipsis
            v-if="playListDetail.description"
            :tooltip="false"
            class="description"
            expand-trigger="click"
            line-clamp="2"
          >
            <n-text depth="3">{{ playListDetail.description }}</n-text>
          </n-ellipsis>
          <n-text v-else class="description">太懒了吧，连简介都没写</n-text>
        </div>
      </div>
      <div v-else class="detail">
        <n-skeleton class="cover" />
        <div class="data">
          <n-skeleton :repeat="4" text />
        </div>
      </div>
    </Transition>
    <!-- 功能区 -->
    <Transition name="fade" mode="out-in">
      <n-flex :key="isUserPLayList" class="menu" justify="space-between">
        <n-flex class="left">
          <n-button
            :disabled="playListData === null || playListData === 'empty' || loadingMsg !== null"
            :focusable="false"
            type="primary"
            class="play"
            tag="div"
            circle
            strong
            secondary
            @click="playAllSongs(playListData)"
          >
            <template #icon>
              <n-icon size="32">
                <SvgIcon icon="play-arrow-rounded" />
              </n-icon>
            </template>
          </n-button>
          <n-button
            v-if="!isUserPLayList"
            :focusable="false"
            class="like"
            size="large"
            tag="div"
            round
            strong
            secondary
            @click="likeOrDislike(playlistId)"
          >
            <template #icon>
              <n-icon>
                <SvgIcon
                  :icon="
                    isLikeOrDislike(playlistId) ? 'favorite-outline-rounded' : 'favorite-rounded'
                  "
                />
              </n-icon>
            </template>
            {{ isLikeOrDislike(playlistId) ? "收藏歌单" : "取消收藏" }}
          </n-button>
          <n-button
            v-else
            :focusable="false"
            class="like"
            size="large"
            tag="div"
            round
            strong
            secondary
            @click="playlistUpdateRef?.openUpdateModal(playListDetail)"
          >
            <template #icon>
              <n-icon>
                <SvgIcon icon="edit" />
              </n-icon>
            </template>
            编辑歌单
          </n-button>
          <n-dropdown :options="moreOptions" trigger="hover" placement="bottom-start">
            <n-button
              :focusable="false"
              class="more"
              size="large"
              tag="div"
              circle
              strong
              secondary
            >
              <template #icon>
                <n-icon>
                  <SvgIcon icon="format-list-bulleted" />
                </n-icon>
              </template>
            </n-button>
          </n-dropdown>
        </n-flex>
        <n-flex class="right">
          <Transition name="fade" mode="out-in">
            <n-input
              v-if="playListData !== 'empty' && playListData?.length"
              :input-props="{ autoComplete: false }"
              class="search"
              placeholder="模糊搜索"
              clearable
            >
              <template #prefix>
                <n-icon size="18">
                  <SvgIcon icon="search-rounded" />
                </n-icon>
              </template>
            </n-input>
          </Transition>
        </n-flex>
      </n-flex>
    </Transition>
    <!-- 列表 -->
    <Transition name="fade" mode="out-in">
      <SongList
        v-if="playListData.length"
        :data="playListData"
        :sourceId="playlistId"
        @click.stop
      />
      <n-empty v-else :description="`歌单为空`" style="margin-top: 60px" size="large">
        <template #icon>
          <n-icon>
            <SvgIcon icon="search-off" />
          </n-icon>
        </template>
      </n-empty>
    </Transition>
    <!-- 歌单编辑 -->
    <!-- <PlaylistUpdate ref="playlistUpdateRef" @getPlayListDetailData="getPlayListDetailData" /> -->
  </div>
  <div v-else class="title">
    <n-text class="key">参数不完整</n-text>
    <n-button :focusable="false" class="back" strong secondary @click="router.go(-1)">
      返回上一页
    </n-button>
  </div>
</template>

<script setup>
import { NIcon } from "naive-ui";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { siteData } from "@/stores";
import { formatNumber } from "@/utils/helper";
import { getTimestampTime } from "@/utils/timeTools";
import { playAllSongs } from "@/utils/Player";
import SvgIcon from "@/components/Global/SvgIcon";
import { getPlaylist } from "./api";
import SongList from "./SongList.vue";

const router = useRouter();
const data = siteData();
const { userLikeData } = storeToRefs(data);

// 歌单 ID
const playlistId = ref(router.currentRoute.value.query.id);

// 子组件
const playlistUpdateRef = ref(null);

// 歌单数据
const loadingMsg = ref(null);
const isUserPLayList = ref(false);
const playListDetail = ref(null);
const playListData = ref([]);

// 更多操作数据
const moreOptions = ref([]);

// 判断收藏还是取消
const isLikeOrDislike = (id) => {
  const playlists = userLikeData.value.playlists;
  if (playlists.length) {
    return !playlists.some((item) => item.id === Number(id));
  }
  return true;
};

const getSongData = (songs) => {
  const songsDetail = [];
  for (const song of songs) {
    songsDetail.push({
      id: song.id,
      name: song.name,
      artists: [
        {
          id: song.artist.id,
          name: song.artist.name,
          tns: [],
          alias: [],
        },
      ],
      album: {
        id: "",
        name: song.name,
        picUrl: "",
        tns: [],
        pic_str: "",
        pic: "",
      },
      cover: `http://127.0.0.1:3000/api/file/${song.coverId}`,
      coverSize: {
        s: `http://127.0.0.1:3000/api/file/${song.coverId}`,
        m: `http://127.0.0.1:3000/api/file/${song.coverId}`,
        l: `http://127.0.0.1:3000/api/file/${song.coverId}`,
        xl: `http://127.0.0.1:3000/api/file/${song.coverId}`,
      },
      mv: 0,
      fee: 8,
      duration: " ",
    });
  }
  playListData.value = songsDetail;
};

const getData = (id) => {
  getPlaylist(id).then((res) => {
    playListDetail.value = res[0];
    getSongData(playListDetail.value.songs);
  });
};

watch(
  () => router.currentRoute.value,
  async (val) => {
    // playListDetail.value = (await getPlaylist(val.query?.id))[0];
    // getSongData(playListDetail.value.songs);
    getData(val.query?.id);
  },
);

onBeforeMount(async () => {
  // playListDetail.value = (await getPlaylist(playlistId.value))[0];
  // getSongData(playListDetail.value.songs);
  getData(playlistId.value);
});

onBeforeUnmount(() => {
  loadingMsg.value?.destroy();
  loadingMsg.value = null;
});

const f5Callback = (e) => {
  if (e.key === "F5") {
    getData(playlistId.value);
  }
};
onMounted(() => {
  window.addEventListener("keydown", f5Callback);
});

onUnmounted(() => {
  window.removeEventListener("keydown", f5Callback);
});
</script>

<style lang="scss" scoped>
.playlist {
  .detail {
    display: flex;
    flex-direction: row;
    align-items: stretch;
    margin-bottom: 20px;
    .cover {
      position: relative;
      display: flex;
      width: 200px;
      height: 200px;
      min-width: 200px;
      margin-right: 20px;
      border-radius: 8px;
      .cover-img {
        width: 100%;
        height: 100%;
        border-radius: 8px;
        z-index: 1;
        transition:
          filter 0.3s,
          transform 0.3s;
        :deep(img) {
          width: 100%;
          opacity: 0;
          object-fit: cover !important;
          transition: opacity 0.35s ease-in-out;
        }
        &:active {
          transform: scale(0.98);
        }
      }
      .cover-shadow {
        position: absolute;
        top: 4px;
        height: 100%;
        width: 100%;
        filter: blur(16px) opacity(0.6);
        transform: scale(0.92, 0.96);
        z-index: 0;
        background-size: cover;
        aspect-ratio: 1/1;
      }
    }
    .data {
      width: 100%;
      .name {
        font-size: 30px;
        font-weight: bold;
        margin-bottom: 12px;
        -webkit-line-clamp: 2;
      }
      .creator {
        display: flex;
        flex-direction: row;
        align-items: center;
        .n-avatar {
          width: 28px;
          height: 28px;
          margin-right: 8px;
        }
        .nickname {
          transition: color 0.3s;
          cursor: pointer;
          &:hover {
            color: var(--main-color);
          }
        }
        .create-time {
          margin-left: 12px;
          font-size: 13px;
        }
      }
      .tags {
        margin-top: 12px;
        .pl-tags {
          font-size: 13px;
          padding: 0 16px;
          line-height: 0;
          cursor: pointer;
          transition:
            transform 0.3s,
            background-color 0.3s,
            color 0.3s;
          &:hover {
            background-color: var(--main-second-color);
            color: var(--main-color);
          }
          &:active {
            transform: scale(0.95);
          }
        }
      }
      .num {
        margin-top: 12px;
        .num-item {
          display: flex;
          flex-direction: row;
          align-items: center;
          .n-icon {
            margin-right: 4px;
            // color: var(--main-color);
          }
        }
      }
      .description {
        margin-top: 12px;
        margin-left: 2px;
        .n-text {
          display: initial;
        }
      }
      :deep(.n-skeleton) {
        &:first-child {
          width: 60%;
          margin-top: 0;
          height: 40px;
        }
        height: 30px;
        margin-top: 12px;
        border-radius: 8px;
      }
    }
  }
  .menu {
    flex-wrap: nowrap;
    align-items: center;
    margin: 26px 0;
    .left {
      flex-wrap: nowrap;
      align-items: center;
      .play {
        --n-width: 46px;
        --n-height: 46px;
      }
    }
    .right {
      .search {
        height: 40px;
        width: 130px;
        display: flex;
        align-items: center;
        border-radius: 40px;
        transition:
          width 0.3s,
          background-color 0.3s;
        &.n-input--focus {
          width: 200px;
        }
      }
    }
  }

  @media (max-width: 700px) {
    .detail {
      .cover {
        width: 140px;
        height: 140px;
        min-width: 140px;
      }
      .data {
        .name {
          font-size: 20px;
          margin-bottom: 4px;
        }
        .creator {
          .n-avatar {
            width: 20px;
            height: 20px;
            margin-right: 6px;
          }
          .nickname {
            font-size: 12px;
          }
          .create-time {
            margin-left: 6px;
            font-size: 12px;
          }
        }
        .tags {
          .pl-tags {
            font-size: 12px;
            padding: 0 12px;
          }
        }
        .num,
        .description {
          display: none !important;
        }
      }
    }
    .menu {
      margin: 20px 0;
      .left {
        .play {
          --n-width: 40px;
          --n-height: 40px;
          .n-icon {
            font-size: 22px !important;
          }
        }
        .like {
          --n-height: 36px;
          --n-font-size: 13px;
          --n-padding: 0 16px;
          --n-icon-size: 18px;
          :deep(.n-button__icon) {
            margin: 0;
          }
          :deep(.n-button__content) {
            display: none;
          }
        }
        .more {
          --n-height: 36px;
          --n-font-size: 13px;
          --n-icon-size: 18px;
        }
      }
      .right {
        .search {
          height: 36px;
          width: 130px;
          font-size: 13px;
        }
      }
    }
  }
}
.title {
  display: flex;
  flex-direction: column;
  .key {
    margin: 10px 0;
    font-size: 36px;
    font-weight: bold;
    margin-right: 8px;
  }
  .back {
    width: 98px;
  }
}
</style>
