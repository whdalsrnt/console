<template>
    <div class="right-side-menu">
        <div class="menu-wrapper">
            <div class="menu-button opacity"
                 :class="{opened: openedMenu === 'support'}"
                 @click.stop="toggleMenu('support')"
            >
                <p-i class="menu-icon"
                     name="ic_support"
                     color="inherit transparent"
                />
            </div>
            <div v-if="openedMenu === 'support'"
                 v-click-outside="hideMenu"
                 class="sub-menu-wrapper right-align"
            >
                <p-anchor v-for="(item, index) in supportMenu" :key="index"
                          :href="item.link" target="_blank"
                          :show-icon="false"
                          class="sub-menu"
                >
                    <span>{{ item.label }}</span>
                    <p-i class="external-link-icon" name="ic_external-link"
                         width="0.875rem" height="0.875rem"
                    />
                </p-anchor>
            </div>
        </div>
        <div class="menu-wrapper account">
            <div class="menu-button account"
                 @click.stop="toggleMenu('account')"
            >
                <div class="menu-icon"
                     :class="[{opened: openedMenu === 'account'}, userState.isDomainOwner ? 'root' : ( userState.isAdmin ? 'admin' : 'member') ]"
                />
            </div>
            <div v-if="openedMenu === 'account'"
                 v-click-outside="hideMenu"
                 class="sub-menu-wrapper right-align account"
            >
                <div class="info-wrapper">
                    <div class="info-row">
                        <p-i v-if="userState.isDomainOwner" class="icon" name="root-account" />
                        <p-i v-else-if="!userState.isDomainOwner && userState.isAdmin" class="icon" name="admin" />
                        <p-i v-else class="icon" name="user" />
                        <span class="value">{{ userState.userId }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_ROLE') }}</span>
                        <span class="value">{{ userState.role }}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_TIMEZONE') }}</span>
                        <span class="value">{{ userState.timezone }}</span>
                    </div>
                    <div class="info-row language"
                         @click="toggleLanguageMenu"
                    >
                        <span class="label">{{ $t('COMMON.GNB.ACCOUNT.LABEL_LANGUAGE') }}</span>
                        <div class="value">
                            <span>{{ userState.language }}</span>
                            <div v-if="showLanguageMenu" class="sub-menu-wrapper">
                                <template v-for="(item, index) in languageMenu" @click.native="hideMenu">
                                    <div :key="index" class="sub-menu" @click="changeLanguage(item.name)">
                                        <span>{{ item.label }}</span>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <p-i :name="showLanguageMenu ? 'ic_arrow_top' : 'ic_arrow_bottom'"
                             width="1rem" height="1rem"
                        />
                    </div>
                    <p-divider />
                </div>
                <div class="sub-menu" @click="openProfile">
                    <span>{{ $t('COMMON.GNB.ACCOUNT.LABEL_PROFILE') }}</span>
                </div>
                <div class="sub-menu" @click="signOut">
                    <span>{{ $t('COMMON.GNB.ACCOUNT.LABEL_SIGN_OUT') }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import vClickOutside from 'v-click-outside';

import {
    ComponentRenderProxy, computed, getCurrentInstance, reactive, toRefs,
} from '@vue/composition-api';

import { PAnchor, PI, PDivider } from '@spaceone/design-system';
import { Location } from 'vue-router';
import router from '@/routes';
import { store } from '@/store';
import { showErrorMessage, showSuccessMessage } from '@/lib/util';
import { languages } from '@/store/modules/user/config';
import config from '@/lib/config';

export default {
    name: 'RightSideMenu',
    components: {
        PDivider,
        PAnchor,
        PI,
    },
    directives: {
        clickOutside: vClickOutside.directive,
    },
    props: {
        openedMenu: {
            type: String,
            default: null,
        },
    },
    setup(props, { root, emit }) {
        const vm = getCurrentInstance() as ComponentRenderProxy;
        const state = reactive({
            showLanguageMenu: false,
            supportMenu: config.get('DOCS'),
            languageMenu: computed(() => Object.entries(languages).map(([k, v]) => ({
                label: v, name: k,
            }))),
        });
        const userState = reactive({
            name: computed(() => store.state.user.name),
            email: computed(() => store.state.user.email),
            role: computed(() => {
                const roleArray = store.getters['user/getRoleNames'];
                return roleArray.join(', ');
            }),
            language: computed(() => store.getters['user/languageLabel']),
            timezone: computed(() => store.state.user.timezone),
            userId: computed(() => store.state.user.userId),
            isAdmin: computed((() => store.getters['user/isAdmin'])),
            isDomainOwner: computed(() => store.getters['user/isDomainOwner']),
        });

        /* event */
        const hideMenu = () => {
            state.showLanguageMenu = false;
            emit('hide-menu');
        };
        const toggleMenu = (menu) => {
            emit('toggle-menu', menu);
        };
        const openProfile = () => {
            emit('hide-menu');
            vm.$router.replace({ name: 'userAccount' }).catch(() => {});
        };
        const toggleLanguageMenu = () => {
            state.showLanguageMenu = !state.showLanguageMenu;
        };

        /* action */
        const signOut = async () => {
            const res: Location = {
                name: 'SignOut',
            };
            await router.push(res);
        };
        const changeLanguage = async (language) => {
            try {
                await store.dispatch('user/setUser', {
                    language,
                    timezone: userState.timezone,
                });
                showSuccessMessage(vm.$t('COMMON.GNB.ACCOUNT.ALT_S_UPDATE'), '', root);
                emit('hide-menu');
            } catch (e) {
                showErrorMessage(vm.$t('COMMON.GNB.ACCOUNT.ALT_E_UPDATE'), e, root);
            }
        };

        return {
            ...toRefs(state),
            userState,
            signOut,
            changeLanguage,
            hideMenu,
            toggleMenu,
            openProfile,
            toggleLanguageMenu,
        };
    },
};
</script>

<style lang="postcss" scoped>
.right-side-menu {
    .menu-wrapper {
        position: relative;
        .menu-button {
            @apply text-gray-900;
            cursor: pointer;

            &.opacity {
                opacity: 0.5;
            }
            &.opened {
                @apply text-primary;
                opacity: 1;
            }
            &:hover {
                @apply text-primary;
                opacity: 1;
            }
            &.account {
                margin-left: 1.5rem;

                .menu-icon {
                    width: 2rem;
                    height: 2rem;
                    overflow: hidden;
                    background-size: cover;
                    box-shadow: inset 0 0 0 2px theme('colors.gray.200');
                    margin-top: 0.5rem;

                    &.admin {
                        background: url('~@/assets/icons/admin.svg') no-repeat center center;
                    }
                    &.member {
                        background: url('~@/assets/icons/user.svg') no-repeat center center;
                    }
                    &.root {
                        background: url('~@/assets/icons/root-account.svg') no-repeat center center;
                    }
                    &.opened {
                        box-shadow: inset 0 0 0 2px theme('colors.primary');
                    }
                }
            }

            .menu-icon {
                border-radius: 0.625rem;
            }
        }
        .sub-menu-wrapper {
            @apply bg-white border border-gray-200;
            position: absolute;
            top: 2.5rem;
            right: 0;
            left: auto;
            min-width: 10rem;
            line-height: 1rem;
            box-shadow: 0 0 0.875rem rgba(0, 0, 0, 0.1);
            border-radius: 0.125rem;
            padding: 0.5rem;
            margin: 3px 0;

            &.account {
                min-width: 15.125rem;
            }
            .sub-menu {
                @apply text-gray-900;
                position: relative;
                width: 100%;
                height: 2rem;
                font-size: 0.875rem;
                line-height: 1rem;
                text-decoration: none;
                white-space: nowrap;
                cursor: pointer;
                border-radius: 0.25rem;
                padding: 0.5rem;
                &:hover, &:focus {
                    @apply bg-primary4 text-primary;
                }
                &:active {
                    @apply bg-white;
                }
                .external-link-icon {
                    position: absolute;
                    top: 0.5rem;
                    right: 1rem;
                }
            }
            .info-wrapper {
                padding: 1rem 0.5rem 0.5rem 0.5rem;
                .info-row {
                    position: relative;
                    line-height: 1.5rem;
                    font-size: 0.75rem;

                    &:first-child {
                        @apply text-primary;
                        font-size: 0.875rem;
                        padding-bottom: 1rem;
                    }
                    &.language {
                        display: inline-flex;
                        cursor: pointer;
                        &:hover, &:focus {
                            @apply bg-primary4 text-primary;
                            border-radius: 0.125rem;
                        }
                        .p-i-icon {
                            display: inline-block;
                            margin-top: 0.25rem;
                        }
                        .value {
                            position: relative;
                            .sub-menu-wrapper {
                                top: 1.5rem;
                                left: -1rem;
                                min-width: 9.25rem;
                                max-height: 21rem;
                                overflow-y: auto;
                                z-index: 10;
                            }
                        }
                    }

                    .icon {
                        border-radius: 0.625rem;
                        margin-right: 0.5rem;
                    }
                    .label {
                        @apply text-gray-500 font-bold;
                        padding-right: 0.5rem;
                    }
                }
                .p-divider {
                    margin-top: 1rem;
                }
            }
        }
    }
}
</style>
