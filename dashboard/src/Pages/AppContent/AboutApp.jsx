import React from "react";
import ContentEditor from "./ContentEditor";

const AboutApp = () => (
  <ContentEditor
    slug="about"
    heading="About App"
    description='Manage the "About App" content for the mobile application.'
    placeholder="Enter About App content here..."
  />
);

export default AboutApp;
