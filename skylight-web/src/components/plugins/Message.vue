<template>
<v-snackbar v-model="snackbar" multi-line >
     my snackbar
      <template v-slot:actions>
        <v-btn color="red" variant="text" @click="snackbar = false">Close</v-btn>
      </template>
    </v-snackbar>
</template>

<script setup>
var snackbar = true


</script>
