<template>
    <div class="questions-file-upload">
      <FileUpload
        ref="uploader"
        name="file"
        accept=".pdf, .doc, .docx, .ppt, .pptx, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/vnd.ms-powerpoint, application/vnd.openxmlformats-officedocument.presentationml.presentation"
        :auto="true"
        mode="advanced"
        :showUploadButton="false"
        :showCancelButton="false"
        class="full-clickable-upload"
        @select="onSelectedFiles"
        @upload="onTemplatedUpload($event)"
        @clear="onClearTemplatingUpload"
      >
        <template #header="{ chooseCallback }">
          <div class="flex flex-wrap justify-between items-center flex-1 gap-4">
            <div class="flex gap-2">
              <Button @click="chooseCallback()" icon="pi pi-images" rounded outlined severity="secondary"></Button>
            </div>
          </div>
        </template>
        <template #empty>
          <div class="drop-zone-content">
            <i class="pi pi-cloud-upload" style="font-size: 2rem"/>
            <p>Arraste arquivos ou clique para selecionar</p>
          </div>
        </template>
      </FileUpload>
    </div>
</template>
<script setup>
  import { ref } from 'vue'
  import { useToast } from "primevue/usetoast"
  import { useRouter } from 'vue-router'
  import { generateService } from '~/services/generateService'
  
  const toast = useToast()
  const router = useRouter()
  
  const totalSize = ref(0)
  const files = ref([])
  const uploadProgress = ref(0)
  
  const onSelectedFiles = (event) => {
  const file = event.files[0];
  if (file) {
    files.value = [file];
    totalSize.value = parseInt(formatSize(file.size));
    
    // Chama o upload manualmente após a seleção
    onTemplatedUpload();
  } else {
    files.value = [];
    totalSize.value = 0;
  }
};
  
  const onClearTemplatingUpload = () => {
    totalSize.value = 0
  }
  
  const onTemplatedUpload = async () => {
    console.log('cheguei')
    if (files.value.length === 0) return
  console.log('cheguei')
    try {
      const file = files.value[0]
      console.log("file", file)
      const result = await generateService.fromDocument(file)
  
      toast.add({
        severity: "success",
        summary: "Sucesso",
        detail: "Arquivo enviado com sucesso!",
        life: 3000
      })
      console.log('result', result)
      
      if(result.id_material){
        router.push({ path: `/questions/${result.id_material}` })
      }
      
    } catch (error) {
      console.error(error)
  
      toast.add({
        severity: "error",
        summary: "Erro",
        detail: "Erro ao enviar o arquivo.",
        life: 4000
      })
    }
  }
  
  const formatSize = (bytes) => {
    const k = 1024
    const dm = 3
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
    if (bytes === 0) return `0 ${sizes[0]}`
  
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    const formattedSize = parseFloat((bytes / Math.pow(k, i)).toFixed(dm))
    return `${formattedSize} ${sizes[i]}`
  }
  </script>
  
  <style scoped>
  .drop-zone-content {
    display: flex;
    justify-content: center;
    gap: 10px;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    text-align: center;
  }
  
  :deep(.p-fileupload-advanced) {
    border: 1px dashed #e2e8f0;
    border-radius: 8px;
  }
  
  :deep(.p-fileupload-content) {
    border: none !important;
  }
  </style>
  