export const useThreadStore = () => {
    const reloadTrigger = useState("thread-reload", () => 0);

    const triggerReload = () => {
        reloadTrigger.value++;
    };

    return {
        reloadTrigger,
        triggerReload,
    };
};
