<template>
  <v-container class="fill-height">
    <v-responsive class="align-center text-center fill-height">
      <v-img height="200" src="@/assets/favicon.svg" />
      <div class="text-body-2 font-weight-light">Welcome to</div>
      <h1 class="text-h2 font-weight-bold">Skylight</h1>
      <v-row class="d-flex align-center justify-center mt-14">
        <v-col cols="auto">
          <v-btn min-width="164" rel="noopener noreferrer" size="x-large" target="_blank" @click="$router.push('welcome')"
            variant="text" prepend-icon="mdi-home">Home
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn color="primary" @click="$router.push('dashboard')" rel="noopener noreferrer" size="x-large"
            target="_blank" variant="flat" prepend-icon="mdi-speedometer">Dashboard
          </v-btn>
        </v-col>
        <v-col cols="auto">
          <v-btn size="x-large" target="_blank" variant="text" prepend-icon="mdi-login">Login
          </v-btn>
        </v-col>
      </v-row>
    </v-responsive>
  </v-container>
</template>

<script setup>
//
</script>
