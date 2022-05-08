<template>
  <q-page>
    <q-input
      v-model="newTask"
      placeholder="Add task"
      @keyup.enter="addTask"
      class="bg-cyan-8"
      dark
      filled
      square
    >
      <template v-slot:append>
        <q-btn @click="addTask" icon="add" round dense flat />
      </template>
    </q-input>

    <q-list bordered separator>
      <q-item v-for="task in tasks" :key="task.id" class="bg-cyan-1">
        <q-item-section>
          <q-item-label>{{ task.title }}</q-item-label>
        </q-item-section>
      </q-item>
    </q-list>
  </q-page>
</template>

<script>
import { QSpinnerGears } from "quasar";
export default {
  name: "PageTodo",
  data() {
    return {
      newTaskTitle: "",
      tasks: [],
      loadingTasks: false,
    };
  },
  methods: {
    niceDate(aNumericDate) {
      return date.formatDate(aNumericDate, "D MMM YYYY hh:mma");
    },
    getTasks() {
      this.$q.loading.show({
        spinner: QSpinnerGears,
        spinnerColor: "red",
        messageColor: "white",
        backgroundColor: "light-blue-11",
        message: "Getting task... Hang on..",
      });

      this.$axios
        .get(`${process.env.API}/tasks`)
        .then((response) => {
          this.tasks = response.data;
          this.$q.loading.hide();
        })
        .catch((err) => {
          this.$q.dialog({
            title: "Error getting tasks",
            message: err.message + ",could not connect to Server.",
          });
          this.$q.loading.hide();
        });
    },

    addTask() {
      let newTask = {
        id: Date.now(),
        title: "New Task",
      };
      let formData = new FormData();
      formData.append("id", newTask.id);
      formData.append("title", newTask.title);

      this.$axios
        .post(`${process.env.API}/createTask`, formData)
        .then((response) => {
          this.$q.notify({
            message: "New task Added",
            color: "light-blue-12",
            actions: [{ label: "Dismiss", color: "white" }],
          });
        })
        .catch((err) => {
          this.$q.dialog({
            title: "Error adding new task",
            message: err.message + ",could not connect to Server.",
          });
        });
      this.tasks.push(newTask);
      this.newTask = "";
    },
  },

  mounted() {
    this.getTasks();
  },
};
</script>
