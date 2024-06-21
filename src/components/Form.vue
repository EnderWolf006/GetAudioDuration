<script setup>
import { bitable, FieldType } from '@lark-base-open/js-sdk';
import { ref, onMounted } from 'vue';
import { ElMessage, ElLoading } from 'element-plus'
import { i18n } from '../locales/i18n';

const format = ref(2)
const useZero = ref(false)
const useMerge = ref(false)
const attachmentOptions = ref({})
const outputOptions = ref({})
const attachmentSelectedId = ref(null)
const outputSelectedId = ref(null)
const formatList = ref(new Array(7).fill(0).map((v, i) => {
  return ['format.format' + i, {
    totalSec: 'XX',
    totalMin: 'XX',
    totalHour: 'XX',
    sec: 'XX',
    min: 'XX',
  }]
}))
async function getMediaFileInfo(url) {
  try {
    let response = await fetch(url, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    let contentType = response.headers.get('Content-Type');
    if (!contentType) {
      throw new Error('Could not get Content-Type');
    }

    const mediaMimeTypes = [
      'audio/aac',      // AAC audio
      'audio/midi',     // MIDI audio
      'audio/x-midi',   // MIDI audio
      'audio/mpeg',     // MP3 audio
      'audio/ogg',      // Ogg Vorbis
      'audio/opus',     // Opus audio
      'audio/wav',      // WAV audio
      'audio/webm',     // WebM audio
      'audio/3gpp',     // 3GPP audio
      'audio/3gpp2',    // 3GPP2 audio
      'audio/flac',     // FLAC audio
      'video/mp4',      // MP4 video
      'video/webm',     // WebM video
      'video/ogg',      // Ogg video
      'video/x-msvideo' // AVI video
    ];

    if (!mediaMimeTypes.includes(contentType)) {
      throw new Error('The file is not a recognizable audio or video file.');
    }

    return new Promise((resolve, reject) => {
      const media = contentType.startsWith('audio') ? new Audio(url) : document.createElement('video');
      media.src = url;
      media.addEventListener('loadedmetadata', () => {
        resolve({
          isMedia: true,
          duration: media.duration,
          mediaType: contentType.startsWith('audio') ? 'audio' : 'video'
        });
      });
      media.addEventListener('error', (e) => {
        reject('Error loading media file.');
      });
    });
  } catch (error) {
    console.error('Error:', error);
    return {
      isMedia: false,
      duration: null
    };
  }
}



function durationConverter(totalSec) {
  totalSec = parseInt(Math.round(totalSec));
  const totalMin = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  const totalHour = Math.floor(totalMin / 60);
  const min = totalMin % 60;
  return i18n.global.t(`format.format${format.value}`, {
    totalSec: useZero.value ? totalSec.toString().padStart(2, '0') : totalSec,
    totalMin: useZero.value ? totalMin.toString().padStart(2, '0') : totalMin,
    totalHour: useZero.value ? totalHour.toString().padStart(2, '0') : totalHour,
    sec: (useZero.value ? sec.toString().padStart(2, '0') : sec),
    min: useZero.value ? min.toString().padStart(2, '0') : min,
  })

}

async function handleConvert() {
  const table = await bitable.base.getActiveTable();
  if (!(attachmentSelectedId.value && outputSelectedId.value)) {
    ElMessage({
      message: i18n.global.t('error1'),
      type: 'error',
    })
    return
  }
  const type = await (await table.getFieldById(outputSelectedId.value)).getType()
  if (format.value != 0 && type == FieldType.Number) {
    ElMessage({
      message: i18n.global.t('error2'),
      type: 'error',
    })
    return
  }
  const loading = ElLoading.service({
    lock: true,
    background: 'rgba(0, 0, 0, 0.7)',
  })
  try {
    const attachmentField = await table.getField(attachmentSelectedId.value)
    const outputField = await table.getField(outputSelectedId.value)
    const recordIdList = await table.getRecordIdList();
    const setRecordsData = []
    for (const recordId of recordIdList) {
      if (!await attachmentField.getValue(recordId)) continue
      const fileList = await attachmentField.getAttachmentUrls(recordId)
      let output = useMerge.value ? 0 : ''
      for (const fileUrl of fileList) {
        const fileInfo = await getMediaFileInfo(fileUrl)
        if (!fileInfo.isMedia) continue;
        output += useMerge.value ? fileInfo.duration : `，${durationConverter(fileInfo.duration)}`
      }
      if (useMerge.value) output = durationConverter(output);
      else if (output[0] == '，') output = output.substring(1, output.length)
      // await outputField.setValue(recordId, output);
      setRecordsData.push({
        recordId: recordId,
        fields: {
          [outputField.id]: output
        }
      })
    }
    await table.setRecords(setRecordsData)
    loading.close()
  } catch (e) {
    loading.close()
  }
}

onMounted(async () => {
  // 获取全部附件字段
  const table = await bitable.base.getActiveTable();
  attachmentOptions.value = await table.getFieldMetaListByType(FieldType.Attachment);
  outputOptions.value = [...await table.getFieldMetaListByType(FieldType.Text), ...await table.getFieldMetaListByType(FieldType.Number)];
});



</script>

<template>
  <el-form ref="form" class="form" label-position="top">
    <el-form-item :label="$t('select.attachment')" size="large">
      <el-select v-model="attachmentSelectedId" :placeholder="$t('select.attachment')" style="width: 100%">
        <el-option v-for="field in attachmentOptions" :key="field.id" :label="field.name" :value="field.id" />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('select.output')" size="large">
      <el-select v-model="outputSelectedId" :placeholder="$t('select.output')" style="width: 100%">
        <el-option v-for="field in outputOptions" :key="field.id" :label="field.name" :value="field.id" />
      </el-select>
    </el-form-item>
    <el-form-item :label="$t('select.format')" size="large">
      <el-select v-model="format" :placeholder="$t('select.format')" style="width: 100%">
        <el-option v-for="f, i in formatList" :key="i" :label="$t(...f)" :value="i" />
      </el-select>
      <div>
        <el-checkbox v-model="useZero" :label="$t('useZero')" size="large" />
        <el-checkbox v-model="useMerge" :label="$t('useMerge')" size="large" />
      </div>
    </el-form-item>
    <el-button type="primary" plain size="large" @click="handleConvert">{{ $t('convert') }}</el-button>
  </el-form>
</template>

<style scoped>
.form :deep(.el-form-item__label) {
  font-size: 16px;
  color: var(--el-text-color-primary);
  margin-bottom: 0;
}

.form :deep(.el-form-item__content) {
  font-size: 16px;
}
</style>
