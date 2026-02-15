import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		experimental: {
			remoteFunctions: true
		},
		alias: {
			$routes: 'src/routes'
		}
	},
	compilerOptions: {
		experimental: {
			async: true
		}
	}
};

export default config;
