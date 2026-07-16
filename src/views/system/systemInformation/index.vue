<template>
  <div class="system-information">
    <el-card class="panel-card" shadow="never">
      <template slot="header">
        <div class="card-header">
          <span class="card-title">
            <i class="el-icon-postcard" />
            {{ $t('systemInformation.licenseInfo') }}
          </span>
        </div>
      </template>

      <div class="license-details">
        <div class="info-row">
          <span class="info-label">{{ $t('systemInformation.licenseSubject') }}:</span>
          <span :class="['info-value', { 'is-placeholder': isPlaceholder(currentLicense.company) }]">
            {{ currentLicense.company }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('systemInformation.licenseEdition') }}:</span>
          <div class="info-value info-value--inline">
            <span :class="{ 'is-placeholder': isPlaceholder(currentLicense.editionText) }">
              {{ currentLicense.editionText }}
            </span>
            <el-tag
              v-if="currentLicense.editionTag"
              size="mini"
              effect="plain"
              class="edition-tag"
            >
              {{ currentLicense.editionTag }}
            </el-tag>
          </div>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('systemInformation.effectiveDate') }}:</span>
          <span :class="['info-value', { 'is-placeholder': isPlaceholder(currentLicense.start) }]">
            {{ currentLicense.start }}
          </span>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('systemInformation.expiryDate') }}:</span>
          <div class="info-value info-value--inline">
            <span :class="{ 'is-placeholder': isPlaceholder(currentLicense.expiry) }">
              {{ currentLicense.expiry }}
            </span>
            <span v-if="currentLicense.verify && expiryCountdown" class="countdown-badge">
              {{ expiryCountdown }}
            </span>
          </div>
        </div>
        <div class="info-row">
          <span class="info-label">{{ $t('systemInformation.purchasedModules') }}:</span>
          <div class="module-list">
            <template v-if="currentLicense.modules.length">
              <el-tag
                v-for="module in currentLicense.modules"
                :key="module"
                size="small"
                effect="plain"
                class="module-tag"
              >
                <i class="el-icon-check" />
                {{ module }}
              </el-tag>
            </template>
            <el-tag v-else size="small" type="info" effect="plain" class="module-tag module-tag--placeholder">
              {{ placeholderText }}
            </el-tag>
          </div>
        </div>
        <div class="info-row info-row--machine">
          <span class="info-label">{{ $t('systemInformation.currentMachineCode') }}:</span>
          <div class="machine-code-group">
            <el-input :value="machineCode" disabled class="machine-input" />
            <el-button
              size="mini"
              plain
              class="copy-button"
              icon="el-icon-document-copy"
              @click="copyMachineCode"
            >
              {{ $t('systemInformation.copy') }}
            </el-button>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="panel-card" shadow="never">
      <template slot="header">
        <div class="card-header">
          <span class="card-title">
            {{ $t('systemInformation.importSystemLicense') }}
          </span>
          <span
            :class="[
              'status-pill',
              isLicensed ? 'status-pill--success' : 'status-pill--danger'
            ]"
          >
            <i class="status-dot" />
            {{ isLicensed ? $t('systemInformation.authorizedNow') : $t('systemInformation.unauthorizedNow') }}
          </span>
        </div>
      </template>

      <div class="upload-section">
        <el-upload
          v-if="uploadStage === 'idle'"
          ref="upload"
          class="license-upload"
          drag
          action=""
          :show-file-list="false"
          :auto-upload="true"
          :multiple="false"
          :limit="1"
          accept=".license"
          :http-request="requestLicensePreview"
          :before-upload="beforeUpload"
          :on-progress="handleUploadProgress"
          :on-success="handleUploadSuccess"
          :on-error="handleUploadError"
          :on-exceed="handleExceed"
        >
          <div class="upload-placeholder">
            <div class="upload-icon">
              <i class="el-icon-upload2" />
            </div>
            <div class="upload-title">{{ $t('systemInformation.clickOrDrag') }}</div>
            <div class="upload-tip">{{ $t('systemInformation.fileSizeLimit') }}</div>
          </div>
        </el-upload>

        <div v-else-if="uploadStage === 'uploading'" class="upload-progress-card">
          <div class="progress-line">
            <div class="progress-text">
              <i class="el-icon-loading" />
              {{ $t('systemInformation.uploadingParsing') }}
            </div>
            <div class="progress-percent">{{ uploadPercentage }}%</div>
          </div>
          <el-progress
            :percentage="uploadPercentage"
            :show-text="false"
            :stroke-width="10"
            color="#2f7cff"
          />
        </div>

        <div v-else class="upload-result-section">
          <div class="uploaded-file-card">
            <div class="file-summary">
              <div class="file-icon">
                <i class="el-icon-document" />
              </div>
              <div class="file-meta">
                <div class="file-name">
                  {{ uploadFile && uploadFile.name ? uploadFile.name : placeholderText }}
                  <i class="el-icon-success success-icon" />
                </div>
                <div class="file-desc">
                  {{ formatFileSize(uploadFile && uploadFile.size) }}
                  <span class="file-desc-separator">·</span>
                  {{ $t('systemInformation.parseSuccess') }}
                </div>
              </div>
            </div>
            <el-button type="text" class="reupload-button" @click="reuploadFile">
              <i class="el-icon-refresh-right" />
              {{ $t('reupload') }}
            </el-button>
          </div>

          <div class="preview-card">
            <div class="preview-header">
              <div class="preview-title">
                <svg-icon icon-class="dunpai-2" />
                {{ $t('systemInformation.licensePreview') }}
              </div>
              <div class="preview-tip">{{ $t('systemInformation.previewHint') }}</div>
            </div>

            <div class="preview-grid">
              <div class="preview-item">
                <div class="preview-label">授权主体 (Customer)</div>
                <div class="preview-value">{{ previewLicense.company }}</div>
              </div>
              <div class="preview-item">
                <div class="preview-label">授权版本 (Edition)</div>
                <div class="preview-value preview-value--inline">
                  <span>{{ previewLicense.editionText }}</span>
                  <el-tag
                    v-if="previewLicense.editionTag"
                    size="mini"
                    effect="plain"
                    class="edition-tag"
                  >
                    {{ previewLicense.editionTag }}
                  </el-tag>
                </div>
              </div>
              <div class="preview-item">
                <div class="preview-label">生效日期 (Valid From)</div>
                <div class="preview-value">{{ previewLicense.start }}</div>
              </div>
              <div class="preview-item">
                <div class="preview-label">到期日期 (Valid Until)</div>
                <div class="preview-value preview-value--inline">
                  <span>{{ previewLicense.expiry }}</span>
                  <span v-if="previewExpiryCountdown" class="countdown-badge">
                    {{ previewExpiryCountdown }}
                  </span>
                </div>
              </div>
              <div class="preview-item preview-item--modules">
                <div class="preview-label">已购模块 (Authorized Modules)</div>
                <div class="module-list module-list--preview">
                  <template v-if="previewLicense.modules.length">
                    <el-tag
                      v-for="module in previewLicense.modules"
                      :key="module"
                      size="small"
                      effect="plain"
                      class="module-tag"
                    >
                      <i class="el-icon-check" />
                      {{ module }}
                    </el-tag>
                  </template>
                  <el-tag v-else size="small" type="info" effect="plain" class="module-tag module-tag--placeholder">
                    {{ placeholderText }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </el-card>

    <div class="page-actions">
      <el-button
        type="primary"
        icon="el-icon-lock"
        :disabled="uploadStage !== 'uploaded'"
        :loading="activating"
        class="activate-button"
        @click="activateLicense"
      >
        {{ $t('systemInformation.confirmAndActivate') }}
      </el-button>
    </div>
  </div>
</template>

<script>
import { licenseAnalysisI, licenseSetFileI } from '@/api/system/license'
import { licenseVerifyI } from '@/api/system/systemInformation'

const PLACEHOLDER_TEXT = '--'
const LICENSE_FIELD_KEYS = [
  'verify',
  'authorized',
  'active',
  'valid',
  'company',
  'customer',
  'subject',
  'edition',
  'version',
  'start',
  'expiry',
  'modules',
  'authorizedModules',
  'code',
  'machineCode'
]

export default {
  name: 'SystemInformation',
  data() {
    return {
      placeholderText: PLACEHOLDER_TEXT,
      machineCode: PLACEHOLDER_TEXT,
      licenseInfo: this.createEmptyLicenseInfo(),
      previewLicenseInfo: this.createEmptyLicenseInfo(),
      uploadStage: 'idle',
      uploadPercentage: 0,
      uploadFile: null,
      selectedLicenseFile: null,
      activating: false
    }
  },
  computed: {
    isLicensed() {
      return !!this.licenseInfo.verify
    },
    currentLicense() {
      return this.licenseInfo
    },
    previewLicense() {
      return this.previewLicenseInfo
    },
    expiryCountdown() {
      return this.getCountdownText(this.currentLicense.expiry)
    },
    previewExpiryCountdown() {
      return this.getCountdownText(this.previewLicense.expiry)
    }
  },
  created() {
    this.refreshLicenseInfo()
  },
  activated() {
    this.refreshLicenseInfo()
  },
  methods: {
    createEmptyLicenseInfo() {
      return {
        verify: false,
        company: PLACEHOLDER_TEXT,
        editionText: PLACEHOLDER_TEXT,
        editionTag: '',
        start: PLACEHOLDER_TEXT,
        expiry: PLACEHOLDER_TEXT,
        modules: [],
        machineCode: PLACEHOLDER_TEXT
      }
    },
    async refreshLicenseInfo() {
      try {
        const res = await licenseVerifyI()
        const normalized = this.normalizeLicenseInfo(this.extractLicensePayload(res), true)
        this.licenseInfo = normalized
        this.machineCode = normalized.machineCode
      } catch (error) {
        this.licenseInfo = this.createEmptyLicenseInfo()
        this.machineCode = PLACEHOLDER_TEXT
      }
    },
    async copyMachineCode() {
      if (this.isPlaceholder(this.machineCode)) {
        return
      }

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(this.machineCode)
        } else {
          const input = document.createElement('input')
          input.value = this.machineCode
          document.body.appendChild(input)
          input.select()
          document.execCommand('Copy')
          document.body.removeChild(input)
        }
        this.$message.success(this.$t('systemInformation.copySuccess'))
      } catch (error) {
        this.$message.error(this.$t('systemInformation.copyFailed'))
      }
    },
    beforeUpload(file) {
      const isLicenseFile = /\.license$/i.test(file.name)
      const isLt10M = file.size / 1024 / 1024 <= 10

      if (!isLicenseFile) {
        this.$message.error(this.$t('systemInformation.fileTypeError'))
        return false
      }

      if (!isLt10M) {
        this.$message.error(this.$t('systemInformation.fileSizeError'))
        return false
      }

      this.previewLicenseInfo = this.createEmptyLicenseInfo()
      this.uploadStage = 'uploading'
      this.uploadPercentage = 0
      this.selectedLicenseFile = file
      this.uploadFile = {
        name: file.name,
        size: file.size
      }

      return true
    },
    requestLicensePreview(option) {
      const { file, onProgress, onSuccess, onError } = option
      this.uploadStage = 'uploading'
      this.uploadPercentage = 0
      const formData = new FormData()
      formData.append('license', file)

      licenseAnalysisI(formData, (event) => {
        const percent = event && event.total
          ? Math.round((event.loaded / event.total) * 100)
          : this.uploadPercentage
        onProgress({ percent: Math.min(99, Math.max(1, percent || 0)) })
      }).then((response) => {
        onSuccess(response)
      }).catch((error) => {
        onError(error)
      })
    },
    handleUploadProgress(event, file) {
      this.uploadStage = 'uploading'
      this.uploadPercentage = Math.min(99, Math.max(1, Math.round(event.percent || 0)))
      this.uploadFile = {
        name: file.name,
        size: file.size
      }
    },
    handleUploadSuccess(response, file) {
      if (!response || Number(response.code) !== 200) {
        this.handleUploadFailure(this.$t('systemInformation.uploadFailed'))
        return
      }

      this.uploadStage = 'uploaded'
      this.uploadPercentage = 100
      this.uploadFile = {
        name: file.name,
        size: file.size
      }
      this.previewLicenseInfo = this.normalizeLicenseInfo(this.extractLicensePayload(response), false)
      this.$message.success(this.$t('systemInformation.uploadSuccess'))
    },
    handleUploadError(error) {
      const message = error && error.message ? error.message : this.$t('systemInformation.uploadFailed')
      this.handleUploadFailure(message)
    },
    handleUploadFailure(message) {
      this.resetUploadState()
      this.$message.error(message)
    },
    handleExceed(files) {
      if (!files || !files.length) {
        return
      }

      const nextFile = files[0]
      this.resetUploadState()

      this.$nextTick(() => {
        if (!this.$refs.upload) {
          return
        }

        this.$refs.upload.clearFiles()
        this.$refs.upload.handleStart(nextFile)
        this.$refs.upload.submit()
      })
    },
    reuploadFile() {
      this.resetUploadState()
      this.$nextTick(() => {
        const fileInput = this.getUploadInput()
        if (fileInput) {
          fileInput.click()
        }
      })
    },
    getUploadInput() {
      if (!this.$refs.upload || !this.$refs.upload.$el) {
        return null
      }
      return this.$refs.upload.$el.querySelector('input[type="file"]')
    },
    resetUploadState() {
      if (this.$refs.upload) {
        this.$refs.upload.clearFiles()
      }
      this.uploadStage = 'idle'
      this.uploadPercentage = 0
      this.uploadFile = null
      this.selectedLicenseFile = null
      this.previewLicenseInfo = this.createEmptyLicenseInfo()
    },
    async activateLicense() {
      if (this.uploadStage !== 'uploaded' || !this.selectedLicenseFile) {
        return
      }

      this.activating = true
      try {
        const formData = new FormData()
        formData.append('license', this.selectedLicenseFile)
        await licenseSetFileI(formData)
        await this.refreshLicenseInfo()
        if (this.isLicensed) {
          this.resetUploadState()
          this.$message.success(this.$t('systemInformation.activationSuccess'))
          return
        }
        this.$message.warning(this.$t('systemInformation.fileExpired'))
      } catch (error) {
        this.$message.error(this.$t('systemInformation.activationFailed'))
      } finally {
        this.activating = false
      }
    },
    extractLicensePayload(response) {
      const candidates = []

      if (response && response.data && response.data.data) {
        candidates.push(response.data.data)
      }
      if (response && response.data) {
        candidates.push(response.data)
      }
      if (response && response.result) {
        candidates.push(response.result)
      }
      if (response) {
        candidates.push(response)
      }

      for (let i = 0; i < candidates.length; i += 1) {
        const candidate = candidates[i]
        if (this.isPlainObject(candidate) && this.hasLicenseFields(candidate)) {
          return candidate
        }
      }

      for (let i = 0; i < candidates.length; i += 1) {
        if (this.isPlainObject(candidates[i])) {
          return candidates[i]
        }
      }

      return {}
    },
    hasLicenseFields(payload) {
      if (!this.isPlainObject(payload)) {
        return false
      }

      for (let i = 0; i < LICENSE_FIELD_KEYS.length; i += 1) {
        if (Object.prototype.hasOwnProperty.call(payload, LICENSE_FIELD_KEYS[i])) {
          return true
        }
      }

      return false
    },
    normalizeLicenseInfo(payload, maskWhenUnauthorized) {
      const source = this.isPlainObject(payload) ? payload : {}
      const verify = this.toBoolean(this.pickFirst(source, ['verify', 'authorized', 'active', 'valid', 'licenseValid']))
      const editionValue = this.pickFirst(source, ['edition', 'version', 'licenseVersion', 'editionName'])
      const info = {
        verify,
        company: this.toDisplayValue(this.pickFirst(source, ['company', 'customer', 'subject', 'authorizedUnit', 'licensee'])),
        editionText: this.toDisplayValue(this.readEditionText(editionValue)),
        editionTag: this.readEditionTag(source, editionValue),
        start: this.toDisplayValue(this.pickFirst(source, ['start', 'effectiveDate', 'validFrom', 'beginTime'])),
        expiry: this.toDisplayValue(this.pickFirst(source, ['expiry', 'end', 'expireTime', 'validUntil'])),
        modules: this.normalizeModules(this.pickFirst(source, ['modules', 'authorizedModules', 'moduleList', 'purchasedModules', 'features', 'authFunctions'])),
        machineCode: this.toDisplayValue(this.pickFirst(source, ['code', 'machineCode', 'serverCode', 'deviceCode']))
      }

      if (maskWhenUnauthorized && !verify) {
        info.company = PLACEHOLDER_TEXT
        info.editionText = PLACEHOLDER_TEXT
        info.editionTag = ''
        info.start = PLACEHOLDER_TEXT
        info.expiry = PLACEHOLDER_TEXT
        info.modules = []
      }

      return info
    },
    readEditionText(value) {
      if (this.isPlainObject(value)) {
        return this.pickFirst(value, ['name', 'label', 'text', 'title', 'value'])
      }
      return value
    },
    readEditionTag(source, editionValue) {
      const explicitTag = this.pickFirst(source, ['editionEn', 'versionEn', 'editionTag', 'versionTag', 'editionCode', 'versionCode'])
      if (this.hasMeaningfulValue(explicitTag)) {
        return String(explicitTag)
      }

      const editionText = this.readEditionText(editionValue)
      const editionMap = {
        企业旗舰版: 'Enterprise',
        企业版: 'Enterprise',
        专业版: 'Professional',
        标准版: 'Standard',
        社区版: 'Community'
      }

      return editionMap[editionText] || ''
    },
    normalizeModules(modulesValue) {
      if (!modulesValue) {
        return []
      }

      let modules = []

      if (Array.isArray(modulesValue)) {
        modules = modulesValue.map((item) => {
          if (this.isPlainObject(item)) {
            return this.pickFirst(item, ['name', 'label', 'moduleName', 'featureName', 'text', 'value'])
          }
          return item
        })
      } else if (this.isPlainObject(modulesValue)) {
        modules = Object.keys(modulesValue).map((key) => modulesValue[key])
      } else if (typeof modulesValue === 'string') {
        modules = modulesValue.split(/[,，|/]/)
      }

      return modules
        .map((item) => this.toDisplayValue(item, ''))
        .filter((item, index, array) => item && array.indexOf(item) === index)
    },
    getCountdownText(dateText) {
      if (this.isPlaceholder(dateText)) {
        return ''
      }

      const targetDate = this.parseDate(dateText)
      if (!targetDate) {
        return ''
      }

      const diff = targetDate.getTime() - Date.now()
      if (diff < 0) {
        return ''
      }

      const days = Math.ceil(diff / (24 * 60 * 60 * 1000))
      return this.$t('systemInformation.daysLeft', { days })
    },
    parseDate(value) {
      if (!this.hasMeaningfulValue(value)) {
        return null
      }

      const normalized = String(value).replace(/-/g, '/')
      const parsed = new Date(normalized)

      if (Number.isNaN(parsed.getTime())) {
        return null
      }

      return parsed
    },
    formatFileSize(size) {
      if (!size && size !== 0) {
        return PLACEHOLDER_TEXT
      }

      const numericSize = Number(size)
      if (Number.isNaN(numericSize)) {
        return PLACEHOLDER_TEXT
      }

      if (numericSize < 1024) {
        return numericSize + ' Bytes'
      }

      if (numericSize < 1024 * 1024) {
        return (numericSize / 1024).toFixed(2).replace(/\.00$/, '') + ' KB'
      }

      return (numericSize / 1024 / 1024).toFixed(2).replace(/\.00$/, '') + ' MB'
    },
    pickFirst(source, keys) {
      if (!source || !keys || !keys.length) {
        return undefined
      }

      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i]
        if (Object.prototype.hasOwnProperty.call(source, key) && this.hasMeaningfulValue(source[key])) {
          return source[key]
        }
      }

      return undefined
    },
    toDisplayValue(value, fallback) {
      const finalFallback = typeof fallback === 'undefined' ? PLACEHOLDER_TEXT : fallback

      if (!this.hasMeaningfulValue(value)) {
        return finalFallback
      }

      return String(value)
    },
    hasMeaningfulValue(value) {
      return value !== null && value !== undefined && String(value).trim() !== ''
    },
    isPlaceholder(value) {
      return !this.hasMeaningfulValue(value) || String(value) === PLACEHOLDER_TEXT
    },
    toBoolean(value) {
      return value === true || value === 'true' || value === 1 || value === '1'
    },
    isPlainObject(value) {
      return Object.prototype.toString.call(value) === '[object Object]'
    }
  }
}
</script>

<style scoped lang="scss">
.system-information {
  padding: 24px 32px 32px;
  width: 100%;
  box-sizing: border-box;
}

.panel-card {
  margin-bottom: 20px;
  border-radius: 12px;
  border: 1px solid #e8edf5;

  ::v-deep .el-card__header {
    padding: 16px 20px;
    border-bottom: 1px solid #edf1f7;
  }

  ::v-deep .el-card__body {
    padding: 20px;
  }
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1f2d3d;
}

.license-details {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  min-height: 24px;
}

.info-row--machine {
  align-items: center;
}

.info-label {
  width: 96px;
  flex: 0 0 96px;
  margin-right: 28px;
  line-height: 24px;
  color: #334155;
}

.info-value {
  min-height: 24px;
  line-height: 24px;
  color: #111827;
}

.info-value--inline {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.is-placeholder {
  color: #94a3b8;
}

.edition-tag {
  border-color: #bfd4ff;
  color: #2f7cff;
  background: #eef4ff;
}

.countdown-badge {
  display: inline-flex;
  align-items: center;
  padding: 0 8px;
  height: 24px;
  border-radius: 6px;
  background: #e8faf0;
  color: #21a366;
  font-size: 12px;
  line-height: 24px;
}

.module-list {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.module-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  height: 30px;
  border-radius: 6px;
}

.module-tag--placeholder {
  color: #94a3b8;
}

.machine-code-group {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 520px;
}

.machine-input {
  flex: 1;
}

.machine-input ::v-deep .el-input__inner {
  height: 32px;
  line-height: 32px;
  border-radius: 6px;
  background: #f8fafc;
  color: #111827;
}

.copy-button {
  min-width: 78px;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 0 12px;
  height: 28px;
  border-radius: 6px;
  font-size: 13px;
  border: 1px solid transparent;
}

.status-pill--danger {
  color: #f04438;
  background: #fff2f1;
  border-color: #ffc6c2;
}

.status-pill--success {
  color: #16a34a;
  background: #effcf3;
  border-color: #b7efc6;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
}

.upload-section {
  min-height: 260px;
}

.license-upload {
  width: 100%;
}

.license-upload ::v-deep .el-upload {
  display: block;
}

.license-upload ::v-deep .el-upload-dragger {
  width: 100%;
  height: 220px;
  border: 1px dashed #d7dee8;
  border-radius: 12px;
  background: linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.upload-placeholder {
  height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 18px;
  border-radius: 50%;
  background: #eaf2ff;
  color: #2f7cff;
  font-size: 24px;
}

.upload-title {
  margin-bottom: 10px;
  color: #111827;
  font-size: 16px;
}

.upload-tip {
  color: #94a3b8;
  font-size: 13px;
}

.upload-progress-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 138px;
  padding: 0 16%;
  border: 1px solid #edf2f7;
  border-radius: 12px;
  background: linear-gradient(180deg, #fbfdff 0%, #ffffff 100%);
}

.progress-line {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  gap: 16px;
}

.progress-text {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1f2d3d;
  font-size: 16px;
}

.progress-percent {
  color: #2f7cff;
  font-size: 16px;
}

.upload-result-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.uploaded-file-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px 18px;
  border: 1px solid #b7efc6;
  border-radius: 10px;
  background: linear-gradient(90deg, #f6fffa 0%, #ffffff 100%);
}

.file-summary {
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 0;
}

.file-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: #ecfdf3;
  color: #16a34a;
  font-size: 22px;
}

.file-meta {
  min-width: 0;
}

.file-name {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  color: #111827;
  font-size: 16px;
}

.success-icon {
  color: #67c23a;
}

.file-desc {
  color: #64748b;
  font-size: 14px;
}

.file-desc-separator {
  margin: 0 4px;
}

.reupload-button {
  flex-shrink: 0;
  font-size: 15px;
}

.preview-card {
  border: 1px solid #e5eaf3;
  border-radius: 10px;
  overflow: hidden;
}

.preview-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 18px;
  border-bottom: 1px solid #edf1f7;
  background: #f8fafc;
}

.preview-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #1f2d3d;
  font-size: 16px;
  font-weight: 500;
}

.preview-tip {
  color: #94a3b8;
  font-size: 13px;
}

.preview-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 28px;
  padding: 0 20px;
}

.preview-item {
  padding: 18px 0;
  border-bottom: 1px solid #f1f5f9;
}

.preview-item--modules {
  grid-column: 1 / -1;
  border-bottom: 0;
}

.preview-label {
  margin-bottom: 10px;
  color: #94a3b8;
  font-size: 14px;
}

.preview-value {
  color: #111827;
  font-size: 16px;
  line-height: 24px;
}

.preview-value--inline {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.module-list--preview {
  gap: 10px;
}

.page-actions {
  display: flex;
  justify-content: flex-end;
}

.activate-button {
  min-width: 132px;
}

@media (max-width: 992px) {
  .system-information {
    padding: 20px;
  }

  .preview-grid {
    grid-template-columns: 1fr;
  }

  .preview-item--modules {
    grid-column: auto;
  }

  .upload-progress-card {
    padding: 24px;
  }
}

@media (max-width: 768px) {
  .card-header,
  .preview-header,
  .uploaded-file-card,
  .progress-line,
  .info-row--machine {
    flex-direction: column;
    align-items: flex-start;
  }

  .info-row {
    flex-direction: column;
    gap: 8px;
  }

  .info-label {
    width: auto;
    flex-basis: auto;
    margin-right: 0;
  }

  .machine-code-group {
    max-width: none;
    width: 100%;
  }

  .machine-code-group,
  .page-actions {
    width: 100%;
  }

  .activate-button {
    width: 100%;
  }
}
</style>
