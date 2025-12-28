<template>
    <div :class="{'has-logo':showLogo}" :style="{ backgroundColor: $store.state.user.projectData.themeColor || $store.state.settings.bgcColor }">
        <logo v-if="showLogo" :collapse="isCollapse" />
        <el-scrollbar :class="settings.sideTheme" wrap-class="scrollbar-wrapper">
            <el-menu
                :default-active="activeMenu"
                :collapse="isCollapse"
                :background-color="$store.state.user.projectData.themeColor || $store.state.settings.bgcColor"
                :text-color="settings.sideTheme === 'theme-dark' ? variables.menuColor : variables.menuLightColor"
                :unique-opened="true"
                :active-text-color="settings.theme"
                :collapse-transition="false"
                mode="vertical"
            >
                <sidebar-item
                    v-for="(route, index) in sidebarRouters"
                    :key="route.path  + index"
                    :item="route"
                    :base-path="route.path"
                />
            </el-menu>
        </el-scrollbar>
    </div>
</template>

<script>
import { mapGetters, mapState } from "vuex";
import Logo from "./Logo";
import SidebarItem from "./SidebarItem";
import variables from "@/assets/styles/variables.scss";

export default {
    components: { SidebarItem, Logo },
    computed: {
        ...mapState(["settings"]),
        ...mapGetters(["sidebarRouters", "sidebar"]),
        activeMenu() {
            const route = this.$route;
            const { meta, path } = route;
            if (meta.activeMenu) {
                return meta.activeMenu;
            }
            const pathWithoutQuery = path.split('?')[0];
            const result = this.findActiveIndex(this.sidebarRouters, pathWithoutQuery);
            if (result) {
                return result;
            }
            return path;
        },
        showLogo() {
            return this.$store.state.settings.sidebarLogo;
        },
        variables() {
            return variables;
        },
        isCollapse() {
            return !this.sidebar.opened;
        }
    },
    methods: {
        findActiveIndex(routes, currentPath, parentPath = '') {
            const segments = currentPath.split('/').filter(s => s);
            if (segments.length === 0) {
                return null;
            }

            for (let i = segments.length; i >= 1; i--) {
                const pathToMatch = '/' + segments.slice(0, i).join('/');
                const parentPathBuilt = '/' + segments.slice(i).join('/');
                const result = this.findActiveIndexRecursive(routes, pathToMatch, parentPathBuilt);
                if (result) {
                    return result;
                }
            }

            return null;
        },
        findActiveIndexRecursive(routes, currentPath, parentPath = '') {
            for (const route of routes) {
                if (!route || route.hidden) continue;

                if (route.meta && route.meta.type === 'category') {
                    const childResult = this.findActiveIndexRecursive(route.children, currentPath, '');
                    if (childResult) return childResult;
                    continue;
                }

                let fullRoutePath;
                if (route.path.startsWith('/')) {
                    fullRoutePath = parentPath ? parentPath + route.path : route.path;
                } else {
                    fullRoutePath = parentPath ? parentPath + '/' + route.path : '/' + route.path;
                }

                if (route.children && route.children.length > 0) {
                    if (route.meta && route.meta.hideChildrenInNavbar) {
                        const firstChild = route.children[0];
                        let firstChildPath;
                        if (firstChild.path.startsWith('/')) {
                            firstChildPath = fullRoutePath + firstChild.path;
                        } else {
                            firstChildPath = fullRoutePath + '/' + firstChild.path;
                        }

                        if (currentPath === firstChildPath || currentPath.startsWith(fullRoutePath + '/')) {
                            return firstChildPath;
                        }
                    } else {
                        const childResult = this.findActiveIndexRecursive(route.children, currentPath, fullRoutePath);
                        if (childResult) return childResult;
                    }
                }
            }
            return null;
        }
    }
};
</script>
