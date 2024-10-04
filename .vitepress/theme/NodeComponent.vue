<template>
    <div :id="id">
    </div>
</template>

<script>
import { onBeforeUnmount } from "vue";
import { useGlobalState } from './useGlobalState.ts';

export default {
    name: 'NodeComponent',
    props: {
        id: {
            type: String,
            required: true
        },
        content: {
            type: String,
            required: true
        },
        display: {
            type: String,
            required: false
        }
    },
    setup(props) {
        const { set, del } = useGlobalState();
        onBeforeUnmount(() => {
            del(props.id);
        });
        return { set };
    },
    async created() {
        this.set(this.id, decodeURI(this.content), this.display !== "false");
    }
};
</script>

<style scoped></style>