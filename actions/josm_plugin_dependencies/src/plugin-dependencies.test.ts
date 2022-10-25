import { pluginDependencies } from "./plugin-dependencies";
import * as fs from "fs";
import {
  describe,
  expect,
  test,
  jest,
  afterEach,
  beforeEach,
} from "@jest/globals";
import { join } from "path";

const gradleProperties = `
    plugin.main.version = 18218
    plugin.compile.version = 18218
    plugin.canloadatruntime = true
    plugin.author = Taylor Smock
    plugin.class = org.openstreetmap.josm.plugins.mapwithai.MapWithAIPlugin
    plugin.icon = images/dialogs/mapwithai.svg
    plugin.link = https://github.com/JOSM/MapWithAI
    plugin.description = Allows the use of MapWithAI data in JOSM (same data as used in RapiD)
    plugin.requires = utilsplugin2;apache-http
`;
const buildXml = `
<?xml version="1.0" encoding="UTF-8"?>
<project name="conflation" default="dist" basedir=".">

    <property file="build.properties" />

    <!-- enter the SVN commit message -->
    <property name="commit.message" value="Conflation"/>
    <!-- enter the *lowest* JOSM version this plugin is currently compatible with -->
    <property name="plugin.main.version" value="\${josm.required.version}"/>

    <property name="plugin.author" value="Josh Doe"/>
    <property name="plugin.class" value="org.openstreetmap.josm.plugins.conflation.ConflationPlugin"/>
    <property name="plugin.description" value="Tool for conflating data (matching and merging)."/>
    <property name="plugin.icon" value="images/dialogs/conflation.png"/>
    <property name="plugin.link" value="https://wiki.openstreetmap.org/wiki/JOSM/Plugins/Conflation"/>
    <property name="plugin.requires" value="jts;utilsplugin2"/>
    <property name="plugin.canloadatruntime" value="true"/>
    <property name="version.entry.commit.revision" value="\${plugin.version}"/>

    <target name="additional-manifest">
        <manifest file="MANIFEST" mode="update">
            <attribute name="11609_Plugin-Url" value="v0.5.5;https://github.com/JOSM/conflation/releases/download/v0.5.5/conflation.jar" />
            <attribute name="12859_Plugin-Url" value="v0.5.6;https://github.com/JOSM/conflation/releases/download/v0.5.6/conflation.jar" />
            <attribute name="13561_Plugin-Url" value="v0.5.7;https://github.com/JOSM/conflation/releases/download/v0.5.7/conflation.jar" />
            <attribute name="13564_Plugin-Url" value="v0.6.0;https://github.com/JOSM/conflation/releases/download/v0.6.0/conflation.jar" />
            <attribute name="14371_Plugin-Url" value="v0.6.5;https://github.com/JOSM/conflation/releases/download/v0.6.5/conflation.jar" />
            <attribute name="16799_Plugin-Url" value="v0.6.6;https://github.com/JOSM/conflation/releases/download/v0.6.6/conflation.jar" />
        </manifest>
    </target>

    <!-- ** include targets that all plugins have in common ** -->
    <import file="../build-common.xml"/>

    <fileset id="plugin.requires.jars" dir="\${plugin.dist.dir}">
        <include name="jts.jar"/>
        <include name="utilsplugin2.jar"/>
    </fileset>

</project>
`;
describe("test plugin_dependencies/plugin_dependencies", () => {
  afterEach(() => {
    jest.restoreAllMocks().resetAllMocks().clearAllMocks();
  });
  beforeEach(() => {
    jest.spyOn(fs, "readFileSync").mockImplementation((path) => {
      if (path === join(".", "gradle.properties")) {
        return gradleProperties;
      } else if (path === join(".", "build.xml")) {
        return buildXml;
      }
      throw Error("Unexpected path in test");
    });
  });
  test("gradle.properties", async () => {
    jest
      .spyOn(fs, "existsSync")
      .mockImplementation((path) => path === join(".", "gradle.properties"));
    return await pluginDependencies(".").then((dependencies) => {
      expect(dependencies).toContain("utilsplugin2");
      expect(dependencies).toContain("apache-http");
      expect(dependencies.length).toBe(2);
    });
  });
  test("build.xml", async () => {
    jest
      .spyOn(fs, "existsSync")
      .mockImplementation((path) => path === join(".", "build.xml"));
    return await pluginDependencies(".").then((dependencies) => {
      expect(dependencies).toContain("utilsplugin2");
      expect(dependencies).toContain("jts");
      expect(dependencies.length).toBe(2);
    });
  });
});
