$().ready(() => {
    Vue.component('todo-item', {
        props: ['todo'],
        data: function () {
            return {
                editing: false
            }
        },
        methods: {
            saveTodoEdit(e) {
                if (e.keyCode != 13) return true;
                this.editing = false;
                this.$emit('update-todo', this.todo);
            },
            onTodoToggle(e) {
                this.editing = false;
                this.$emit('update-todo', this.todo);
            }
        },
        template: `<li v-bind:class="{ completed: todo.completed, editing: editing }">
                <div class="view">
                  <input class="toggle" type="checkbox" @change="onTodoToggle" v-model="todo.completed" data-selector="checkbox-todo-toggle">
                  <label class="todo-label" v-on:dblclick="editing=true">{{ todo.title }}</label>
                  <button class="duplicate" v-on:click="$emit('duplicate-todo',todo)" data-selector="button-todo-duplicate"></button>
                  <button class="destroy" v-on:click="$emit('remove-todo',todo)" data-selector="button-todo-remove"></button>
                </div>
                <input class="edit" type="text" v-on:keypress="saveTodoEdit" v-model="todo.title" data-selector="input-todo-edit">
              </li>`
    });

    var app = new Vue({
        el: "#app",
        data: {
            todos: [],
            newTodoTitle: '',
            filterMode: 'all',
            todosFilter: (todo) => true,
            nodeLoading: false,
            pythonLoading: false
        },
        computed: {
            filteredTodos() {
                return this.todos.filter(this.todosFilter);
            }
        },
        methods: {
            setFilter(filter) {
                this.filterMode = filter;
                switch (filter) {
                    case 'all':
                        this.todosFilter = (todo) => true;
                        break;
                    case 'active':
                        this.todosFilter = (todo) => !todo.completed;
                        break;
                    case 'completed':
                        this.todosFilter = (todo) => todo.completed;
                        break;
                }
            },
            toggleAll() {
                this.todos.forEach(todo => {
                    let toggledTodo = todo;
                    toggledTodo.completed = !toggledTodo.completed;
                    const action = $.ajax('/todos', {
                        contentType: 'application/json',
                        method: 'PUT',
                        data: JSON.stringify(toggledTodo),
                        dataType: 'json',
                    });
                });
                this.reloadTodos();
            },
            clearCompleted(e) {
                const action = $.ajax('/todos/clear_completed', {
                    method: 'DELETE'
                });
                this.reloadOnFinish(action);
            },
            updateTodo(todo) {
                const action = $.ajax('/todos', {
                    contentType: 'application/json',
                    method: 'PUT',
                    data: JSON.stringify(todo),
                    dataType: 'json',
                });
                this.reloadOnFinish(action);
            },
            duplicateTodo(todo) {
                const action = $.ajax(`/todos/dup/${todo.id}`, {
                    method: 'POST'
                });
                this.reloadOnFinish(action);
            },
            removeTodo(todo) {
                const action = $.ajax(`/todos/${todo.id}`, {
                    method: 'DELETE',
                });
                this.reloadOnFinish(action);
            },
            reloadOnFinish(promise) {
                promise.done((data) => {
                    this.nodeLoading = false;
                    this.pythonLoading = false;
                    data ? console.log(`got status: ${data.status}`) : null;
                    return this.reloadTodos();
                }).catch(console.log);
            },
            reloadTodos() {
                const vm = this;
                $.ajax('/todos', {
                    method: 'GET'
                }).done((todos) => {
                    vm.todos = todos;
                });
            },
            addTodo(text) {
                const action = $.ajax('/todos', {
                    contentType: 'application/json',
                    method: 'POST',
                    data: JSON.stringify({"title": text}),
                    dataType: 'json'
                });

                this.reloadOnFinish(action);
            },
            onAddTodoPressed(e) {
                if (e.keyCode !== 13) return;
                const title = this.newTodoTitle;
                this.addTodo(title);
                this.newTodoTitle = '';
            },
            generateTodoNode() {
                this.nodeLoading = true;
                const action = $.ajax(`/todos/generate/node`, {
                    method: 'POST',
                });
                this.reloadOnFinish(action);
            },
            generateTodoPython() {
                this.pythonLoading = true;
                const action = $.ajax(`/todos/generate/python`, {
                    method: 'POST',
                });
                this.reloadOnFinish(action);
            }
        },
        mounted() {
            this.reloadTodos();
        },
    });
});