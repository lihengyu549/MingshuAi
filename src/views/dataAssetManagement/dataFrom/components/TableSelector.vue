<template>
    <div class="main_div">
        <div class="canChoose">
            <div style="height: 20px;">可选</div>
            <div class="canChoose_main">
                <div class="canChoose_left">
                    <el-tree :data="options" show-checkbox node-key="id" :default-expanded-keys="[]"
                        :default-checked-keys="[]" :props="defaultProps" :render-content="renderContent">
                    </el-tree>
                </div>
                <div class="canChoose_right"></div>
            </div>
        </div>
        <div class="dowmChoose"></div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            selectedCategory: '',
            selectedTable: '',
            selectedTables: [],
            options: [
                { value: '0', label: '全选', parentID: '0', },
                {
                    value: '1',
                    label: 'kms',
                    children: [
                        { value: 'kms_certificate', label: 'kms_certificate', count: 200, parentID: '1', },
                        { value: 'ksm_config', label: 'ksm_config', count: 300, parentID: '1', },
                        { value: 'ksm_dcit', label: 'ksm_dcit', count: 200, parentID: '1', },
                        { value: 'kms_hadoop_key', label: 'kms_hadoop_key', count: 200, parentID: '1', },
                        { value: 'kms_key_pair', label: 'kms_key_pair', count: 200, parentID: '1', }
                    ]
                },
                {
                    value: '2',
                    label: 'scheduler',
                    children: [
                        { value: 'scheduler_task', label: 'scheduler_task', count: 200, parentID: '2', },
                        { value: 'scheduler_log', label: 'scheduler_log', count: 200, parentID: '2', }
                    ]
                },
                {
                    value: '3',
                    label: 'uim',
                    children: [
                        { value: 'uim_user', label: 'uim_user', count: 200, parentID: '3', },
                        { value: 'uim_role', label: 'uim_role', count: 200, parentID: '3', }
                    ]
                },
                {
                    value: '4',
                    label: 'sem',
                    children: [
                        { value: 'sem_data', label: 'sem_data', count: 200, parentID: '4', },
                        { value: 'sem_config', label: 'sem_config', count: 200, parentID: '4', }
                    ]
                },
                {
                    value: '5',
                    label: 'demo',
                    children: [
                        { value: 'demo_table', label: 'demo_table', count: 200, parentID: '5', }
                    ]
                }
            ],
            defaultProps: {
                children: 'aaa',
                label: 'label'
            }
        };
    },
    methods: {
        renderContent(h, { node, data, store }) {
            return (
                <span class="custom-tree-node">
                    <span>{node.label}</span>
                    <span class="expand-icon-box"><i class="el-icon-arrow-right expand-icon"></i></span>
                </span>);
        }
    }
};
</script>

<style scoped>
/* 添加一些基本的样式 */
.main_div {
    width: 100%;
    height: 600px;
    display: flex;
}

.canChoose {
    width: 65%;
    height: 100%;
    margin-right: 40px;
}

.canChoose_main {
    border: 2px solid #c7c7c7;
    height: calc(100% - 20px);
}

.canChoose_left {
    height: 100%;
    width: 45%;
    border-right: 2px solid #c7c7c7;
}

/deep/.el-tree-node {
    border-bottom: 2px solid #c7c7c7;
    height: 40px;

}

/deep/.custom-tree-node {
    width: 100%;
    display: flex;
    justify-content: space-between;
}

/deep/.el-tree-node__content {
    height: 100%;
}

/deep/.expand-icon {
    cursor: pointer;
}

/deep/.expand-icon-box {
    text-align: right;
    margin-right: 20px;
}

.canChoose_right {}

.dowmChoose {
    width: 33%;
    height: 100%;
    background-color: rgb(162, 0, 255);
}
</style>