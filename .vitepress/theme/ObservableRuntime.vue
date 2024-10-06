<template>
    <div>
    </div>
</template>

<script>
import { observableRuntime } from"../markdown.ts";

export default {
    name: 'ObservableRuntime',
    props: {
        content: {
            type: String,
            required: true
        },
    },
    async created() {
        await observableRuntime(JSON.parse(decodeURI(this.content)));
    }
};
</script>

<style scoped>
/* Add your styles here */
</style>
