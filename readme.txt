=== Date and Time Picker Field ===
Contributors: fabrizim
Donate link: http://owlwatch.com
Tags: acf, custom field, form field
Requires at least: 3.6
Tested up to: 3.8.1
Stable tag: 1.0
License: GPLv2 or later
License URI: http://www.gnu.org/licenses/gpl-2.0.html

Custom Form Field for use with Snap form fields

== Description ==



= Compatibility =

This add-on will work with:

* Advanced Custom Fields version 4 and up

== Installation ==


= Plugin =
1. Copy the 'acf-date_time_picker' folder into your plugins folder
2. Activate the plugin via the Plugins admin page

= Include =
1.	Copy the 'acf-date_time_picker' folder into your theme folder (can use sub folders). You can place the folder anywhere inside the 'wp-content' directory
2.	Edit your functions.php file and add the code below (Make sure the path is correct to include the acf-date_time_picker.php file)

`
add_action('acf/register_fields', 'my_register_fields');

function my_register_fields()
{
	include_once('acf-date_time_picker/acf-date_time_picker.php');
}
`


== Screenshots ==

1. Add the Date and Time Picker field
2. Date and Time Picker
3. Time Picker


== Frequently Asked Questions  ==

== Changelog ==
= 1.0 =
* Initial version
