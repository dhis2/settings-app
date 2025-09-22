/**@type {import('@dhis2/cli-app-scripts').D2Config} */
const config = {
    id: '4f6eab1a-29ac-4f7a-b74c-8ba95ea7df49',
    type: 'app',
    name: 'settings',
    title: 'System Settings',
    coreApp: true,
    minDHIS2Version: '2.41',

    entryPoints: {
        app: './src/App.jsx',
    },
    shortcuts: [
        {
            name: 'General',
            url: '#/general',
        },
        {
            name: 'Analytics',
            url: '#/analytics',
        },
        {
            name: 'Server',
            url: '#/server',
        },
        {
            name: 'Appearance',
            url: '#/appearance',
        },
        {
            name: 'Email',
            url: '#/email',
        },
        {
            name: 'Access',
            url: '#/access',
        },
        {
            name: 'Calendar',
            url: '#/calendar',
        },
        {
            name: 'Data import settings',
            url: '#/import',
        },
        {
            name: 'Synchronization',
            url: '#/sync',
        },
        {
            name: 'Scheduled job settings',
            url: '#/scheduledJobs',
        },
        {
            name: 'OAuth2 clients',
            url: '#/oauth2',
        },
    ],
}

module.exports = config
