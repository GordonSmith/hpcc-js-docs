<template>
    <div>
    </div>
</template>

<script>
import { observableRuntime } from"../markdown.ts";

export default {
    name: 'NotebookComponent',
    props: {
        content: {
            type: String,
            required: true
        },
    },
    data() {
        return {
            loading: true
        };
    },
    async created() {
        setTimeout(() => {
            this.loading = false;
            observableRuntime(JSON.parse(decodeURI(this.content)));
        }, 0);
    }
}
</script>

<style scoped>
/* Add your styles here */
</style>