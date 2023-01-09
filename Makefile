%_clean::
	rm -rf actions/$*/node_modules
	rm -rf actions/$*/dist
	rm -rf actions/$*/package-lock.json

%_make::
	cd actions/$* && \
	if [ ! -d "node_modules" ]; then npm install; fi && \
	npm run prepare

%_test::
	cd actions/$* && \
	if [ ! -d "node_modules" ]; then npm install; fi && \
	npm install --no-save prettier npm-check && \
	npm run all && \
	npx prettier --check src && \
	npx npm-check

%_prettier::
	cd actions/$* && \
	if [ ! -d "node_modules" ]; then npm install; fi && \
	npm install --no-save prettier && \
	npx prettier --write src

all: josm_build_make josm_plugin_clone_make josm_plugin_dependencies_make setup-ant_make

clean: josm_build_clean josm_plugin_clone_clean josm_plugin_dependencies_clean setup-ant_clean

prettier: josm_build_prettier josm_plugin_clone_prettier josm_plugin_dependencies_prettier setup-ant_prettier

check: josm_build_test josm_plugin_clone_test josm_plugin_dependencies_test setup-ant_test
