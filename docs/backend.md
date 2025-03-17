# Tess - UI Patterns 2 Backend Assistant
## Component form
The biggest feature of UI Patterns is the generation of forms from the components definition:
From component definition....	... to component form	
Those forms will be shown everywhere a component is used:
#### as blocks:
Using a component as a Drupal block
You need to activate ui_patterns_blocks sub-module.
Blocks are boxes of content rendered into an area, or region, of a web page (such as "User Login" or "Who's online") that can be displayed in regions (such as footer or sidebar) on your page or content display.
In Block Layout (/admin/structure/block)
Every UI component is a Drupal block plugin, available in the "Place block" modal:
For example, to assign any component in the Header region, click on "Place Block" button and choose the component to be placed in this particular region.
The component is configurable as an usual block plugin, with the Component form alongside the block title, the visibility settings and the block placement:
Contextual data sources
There is no specific context here. Only the generic data sources are available.
In Layout Builder
Drupal's Layout Builder allows content editors and site builders to create visual layouts for displaying content. Users can customize how content is arranged on a single page, across types of content, or even create custom landing pages with an easy to use drag-and-drop interface.
The Layout Builder provides the ability to drag and drop site-wide blocks and content fields into regions within a given layout.
Component props are available in the sidebar as block settings:
Contextual data sources
Context	Source	Prop type	Description
Content entity	Data from a field		Switch to a Field context.
Content entity	Entity link	URL	
Content entity	Referenced entities		Switch to an other Content entity context.
### as layouts
You need to activate ui_patterns_layouts sub-module.
Layout plugins
SDC components have a model quite similar to Drupal layout plugins:
Component slots are layout plugin regions
Component props are layout plugin settings
In Layout Builder
Drupal's Layout Builder allows content editors and site builders to create visual layouts for displaying content. Users can customize how content is arranged on a single page, across types of content, or even create custom landing pages with an easy to use drag-and-drop interface.
The Layout Builder provides the ability to drag and drop site-wide blocks and content fields into regions within a given layout.
Each section can contain content arranged in a certain layout. Each UI component is exposed as a layout plugin:
If a component has a thumbnail.webp, it will be shown in the layouts list:
Section configuration is a Component form, without the slots because slots are directly managed by Layout Builder as regions of the layout:
Contextual data sources
There is no UI Patterns sources for slots here because slots are directly managed by Layout Builder as regions. So, only Drupal blocks plugins are available.
Context	Source	Prop type	Description
Content entity	Data from a field		Switch to a Field context.
Content entity	Entity link	URL	
Content entity	Referenced entities		Switch to an other Content entity context.
### in field formatters
Field Formatters are Drupal plugins formatting the output of a content field. For example:
Date field formatted as "... time ago"
Date field formatted with a custom date format
Entity reference field formatted as label
Entity reference field formatted as a rendered entity
...
There are 2 field formatters provided by ui_patterns_field_formatters sub-module:
Component per item: Each item will be displayed as a component.
Component: Available only for multi-valued fields. The full field is displayed as a component.
In Manage Display
Manage display manages the way your content is displayed on the frontend.
The UI Patterns field formatters are available in the format select list, for every fields,
Once selected, the field formatters are configurable as usual field formatters, with the UI Patterns 2's Component form
Contextual data sources
Context	Source	Prop type	Description
Field	Field formatter	Slot	
Field	Field label	String	
Field	Field prop: *	(many)	
Reference field	Field prop: entity		Switch to a Content entity context.
Content entity	Data from a field		Switch to a Field context.
Content entity	Entity link	URL	
Content entity	Referenced entities		Switch to an other Content entity context.
In Layout Builder
Drupal's Layout Builder allows content editors and site builders to create visual layouts for displaying content. Users can customize how content is arranged on a single page, across types of content, or even create custom landing pages with an easy to use drag-and-drop interface.
Fields are available as blocks:
Once selected, the field formatters are configurable as usual field formatters, with the UI Patterns 2's Component form:
Contextual data sources
Context	Source	Prop type	Description
Field	Field formatter	Slot	
Field	Field label	String	
Field	Field prop : *	(many)	
Reference field	Field prop: entity		Switch to a Content entity context.
Content entity	Data from a field		Switch to a Field context.
Content entity	Entity link	URL	
Content entity	Referenced entities		Switch to an other Content entity context.
In Views
Drupal Views is both:
a query builder: fetch content from the database, with filters, sorts and grouping.
a display builder: present the results as lists, galleries, tables, maps, graphs, reports...
If your display accepts fields, the field formatters are available:
Once selected, the field formatters are configurable as usual field formatters, with the UI Patterns 2's Component form:
Contextual data sources
Context	Source	Prop type	Description
Field	Field formatter	Slot	
Field	Field label	String	
Field	Field prop: *	(many)	
Reference field	Field prop: entity		Switch to a Content entity context.
Content entity	Data from a field		Switch to a Field context.
Content entity	Entity link	URL	
Content entity	Referenced entities		Switch to an other Content entity context.
### in views
Using a component with Views
Drupal Views is both:
a query builder: fetch content from the database, with filters, sorts and grouping.
a display builder: present the results as lists, galleries, tables, maps, graphs, reports...
You need to activate ui_patterns_views sub-module.
View style plugin
To build the display around the results:
the table and not the rows
the slider and not the slides
the map and not the points of interest
the mosaic and not the pictures
Steps
Pick "Component" in the modal:
Select the component and fill the configuration form:
Component form
Contextual data sources
Context	Source	Prop type	Description
View	View title	String	
View	View rows	Slot	
View row plugin
To build the display of each result:
the rows instead of the table
the sliders instead of the slides
the point of interests instead of the map
the pictures instead of the mosaic
Pick "Component" in the modal:
Select the component and fill the configuration form:
Contextual data sources
Context	Source	Prop type	Description
View row	View title	String	
View row	View field	Slot	
Content entity	Data from a field		Switch to a Field context.
Content entity	Entity link	URL	
Content entity	Referenced entities		Switch to an other Content entity context.
...
## Data sources
Values are taken from sources:
"Widgets": simple form elements storing directly the data filled by the user. For example, a textfield for a string or a checkbox for a boolean.
Sources retrieving data from Drupal API: they can be context agnostic (ex: a menu for links) or context specific (ex: the title field for a string)
Context switchers: They don't retrieve data but they give access to other data sources. For example, the author fields from an article content.
If there is only a single source available, the source form is directly displayed:
If there are at least 2, a source selector is shown:
Some sources doesn't have a form, selecting the source is enough:
Context
Sometimes sources require another object in order to retrieve the data. This is known as context.
Some source doesn't need a context and are site wide, for example:
All “widgets” which are source plugins with only direct input: Textfield, Select, Checkbox…
List of all menus
The breadcrumb
…
But some of them will need context. Examples:
Context	Source	Prop type	Description
Content entity	Data from a field		Switch to a Field context.
Content entity	Entity link	URL	
Content entity	Referenced entities		Switch to an other Content entity context.
Field	Field formatter	Slot	
Field	Field label	String	
Field	Field prop : *	(many)	
Reference field	Field prop: entity		Switch to a Content entity context.
View	View title	String	
View	View rows	Slot	
View row	View title	String	
View row	View field	Slot	
Variant selector
Some components have variants, a list of different "look" of the component. Variants doesn't change the model or the meaning of the component, only the look.
Slots
SDC components are made of slots & props:
Slots: “areas” for free renderables only, like Drupal blocks or other SDC components for example.
Props: strictly typed data only, for some UI logic in the template.
You can draw the slots areas in a component screenshot:
For each slots, its is possible to add one or many sources:
For example:
"Component": nest another SDC component in the slot.
"Block": add a Drupal block plugin
"Wysiwyg": a simple text editor, using the text formats defined in your site.
Other modules can add other sources. For example, "Icon" in this screenshot is brought by https://www.drupal.org/project/ui_icons
Once a source is added, it can be configured and we can add more because the selector is still present:
Sources can be reordered inside a slot.
Using the "Component" source, we have access to the embedded component slots and we can nest data:
Props
A bit like the form for slots with 2 main differences:
We don’t allow multiple items, so we can replace the source but not add some (and of course no reordering)
The default source form is already loaded.
The available sources are varying according to both:
the prop type. Each prop as a type, which is related to its JSON schema typing, but not exactly the same. You can check what type has a prop in the component library. A prop without a type is not displayed in the form.
the context, as explained before.
## presenter template
Using a component in Drupal templates
Presenter templates
Presenter templates are standard Drupal templates that:
transform data received from Drupal
use Twig include() function to include one or more components and pass the transformed data.
should be totally free of markup
use theme suggestions to plug itself to data model
For example, a “normal” template has markup:
{% if subtitle %}
<h3 class="callout__subtitle">{{ subtitle }}</h3>
{% endif %}
But a presenter template has only a call to a component (and sometimes a bit of logic):
{{ include('my_theme:menu', {
  'items': items,
  'attributes': attributes.addClass('bg-primary'),
}, with_context=false)}}
Examples of presenter templates can be found on those folders:
https://git.drupalcode.org/project/ui_suite_bootstrap/-/tree/5.1.x/templates
https://git.drupalcode.org/project/ui_suite_daisyui/-/tree/4.0.x/templates
https://git.drupalcode.org/project/ui_suite_dsfr/-/tree/1.1.x/templates
https://git.drupalcode.org/project/ui_suite_material/-/tree/2.0.x/templates
https://git.drupalcode.org/project/ui_suite_uswds/-/tree/4.0.x/templates
More about presenter templates:
https://www.aleksip.net/presenting-component-projects (May 2016)
https://www.mediacurrent.com/blog/accommodating-drupal-your-components/ (Broken link)
Don’t use presenter templates when site building is possible
Presenter templates are a clever trick, however they hurt the site building because everything which is normally set in the display settings by the site builder has to be done in a Twig file by the developer.
However, there are some cases when site building is not easily possible. For examples:
rendering a menu. Menu are config entities without configurable displays.
rendering a content entity where the configurable display has no admin UI.
🚫 Don't do presenter templates when display building is available:
Node: /admin/structure/types/manage/{bundle}/display
BlockContent: /admin/structure/block/block-content/manage/{bundle}/display
Comment: /admin/structure/comment/manage/{bundle}/display
Media: /admin/structure/media/manage/{bundle}/display
Taxonomy Term: /admin/structure/taxonomy/manage/{bundle}/overview/display
User: /admin/config/people/accounts/display
Views
✅ Presenter templates are OK for renderables without display building:
Page layout: page.html.twig and region.html.twig
Menu config entity: menu.html.twig
...
Slots & props
Most of those templates have distinct variables for data to send to slots or props.
For example, in node.html.twig:
node variable has the typed data to send to props
content has the renderable data to send to slots
Other example, in user.html.twig:
user variable has the typed data to send to props
content has the renderable data to send to slots
Clean default templates
Even without doing presenter templates, template overriding can be useful to clean some cruft from templates provided by core or contrib modules.
The node.html.twig template is a good example, because it carries a lot of legacy junk, like a title base field display condition based on view mode name (!) and a poor man submitted by.
It is better to keep those templates as lean as possible, and to push the complexity to layouts and other display modes plugins.
For example:
field.html.twig
block.html.twig
node.html.twig
taxonomy-term.html.twig
media.html.twig
comment.html.twig
...
Those templates content can be replaced by:
{% if attributes.storage() %}
<div{{ attributes }}>
{% endif %}
  {{ content }}
{% if attributes.storage() %}
</div>
{% endif %}
Or sometimes, by more complex stuff like:
{% if attributes.storage() %}
<div{{ attributes }}>
{% endif %}
  {{ title_prefix }}
  {{ title_suffix }}
  {{ content }}
  {% if attributes.storage() %}
  <div{{ content_attributes }}>
  {% endif %}
   {{ content }}
  {% if attributes.storage() %}
  </div>
  {% endif %}
{% if attributes.storage() %}
</div>
{% endif %}
Some markup of components or some utilities style expect specific markup with direct children like flex feature. Currently when trying to use those components in lists the wrappers inside templates like field.html.twig and node.html.twig will interfere with the expected markup. So sometimes even the wrappers need to be removed with templates override.
Use the Entity View Display Template Suggestions module to be able to remove the wrapper of some entity displays. If the theme provides templates with bare minimum markup like just the "content" variable printed, for content entities with the module you will be able to remove the wrapper with configuration.