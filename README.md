<!-- Output copied to clipboard! -->

<!-----

You have some errors, warnings, or alerts. If you are using reckless mode, turn it off to see inline alerts.
* ERRORs: 0
* WARNINGs: 0
* ALERTS: 17

Conversion time: 5.044 seconds.


Using this Markdown file:

1. Paste this output into your source file.
2. See the notes and action items below regarding this conversion run.
3. Check the rendered output (headings, lists, code blocks, tables) for proper
   formatting and use a linkchecker before you publish this page.

Conversion notes:

* Docs to Markdown version 1.0β34
* Sun Nov 12 2023 22:52:04 GMT-0800 (PST)
* Source doc: adsf
* Tables are currently converted to HTML tables.
* This document has images: check for >>>>>  gd2md-html alert:  inline image link in generated source and store images to your server. NOTE: Images in exported zip file from Google Docs may not appear in  the same order as they do in your doc. Please check the images!

----->

# (Un)Civil Asset Forfeiture

## 1. Basic Info

Jonathan Yu  \
[Github](https://www.github.com/JonAndYu)

[Linkedin](https://www.linkedin.com/in/jonathan-yu-114b701b1/)

[Video](https://www.youtube.com/watch?v=wAAZYP6ZVvs&ab_channel=Jonomuffin)

The original document was written in google docs then converted to markdown. Here is the google doc link to see the images. https://docs.google.com/document/d/1ISip4L0-r8eMpkg8ihSgi-rQ6yyq9LjlUwDexlB7LhA/edit?usp=sharing


## 2. Overview 

Forfeiture refers to the legal process where someone loses their property or assets as a result of their involvement in illegal activities. In some types of forfeiture, such as civil forfeiture, law enforcement may seize property without any evidence of criminal activity which leaves the burden on the owner to legally fight for the return of the property. Unfortunately, his burden disproportionately victimizes lower income individuals who may not have the necessary financial backing to reclaim their property.

The goal of our visualization is to allow concerned US citizens and policy makers to view how much of forfeiture is justly seized, viewing discrepancies between what’s seized of what value, and how much of it results in a conviction. This will allow citizens and policy makers to inform themselves and hold the government accountable for unjust seizure.



<p id="gdcalert1" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image1.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert2">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image1.png "image_tooltip")



## 3. Data and Data Preprocessing 

The Institute for Justice collected records of civil asset forfeitures across 47 different US regions, including 45 states, Washington D.C, and the US Departments of Justice and Treasury. Taken from the Institutate of Justice ,[https://ij.org/report/policing-for-profit-3/policing-for-profit-data/](https://ij.org/report/policing-for-profit-3/policing-for-profit-data/), our group will take a closer look at visualizing the National_Revenue.csv which contains a range of records between 1986 - 2019. While the range of dates are significant, each state reports a different quantity and quality of data. 

On average, the states have 12 years of records with most records in the range between the early 2000s and the late 2010s. There are several notable exceptions:



* Iowa - Released 33 years of records ranging between 1986 - 2019
* Idaho - Released 1 year of records in 2018
* Kansas - Released 1 year of records in 2019
* Wisconsin - Released 1 year of records in 2018

A one time python script was used to preprocess the data. The script, as well as the original dataset, will be avaliable in the github repo, but the visualization will directly use the processed data. This dataset was a compilation of every state’s data, so some of the naming conventions in categorical attributes differed. For example, in the PROCD_TYPE attribute, “civil judicial” and  “Civil Judicial '' refer to the same category so they were standardized to use title capitalization. 

The two attributes which were heavily imputed were PROP_TYPE and CONV_TYPE. Each state was considered locally, if that state contains some values in either column, unknown observations are imputed in such a way to maintain the preexisting ratio. If no attribute data is available for that state in either column, they were imputed to maintain the national ratio for property types and conviction types. The below attribute information table shows the new range and cardinality of the processed dataset which matches the data dictionary on the website.

Included at the bottom of the attribute table are attributes and values that were derived from the dataset. All of them were programmatically created on an as needed basis whenever the visualization called for it. The description describes their use case.


### Attribute Information Table

Number of records: 650244


<table>
  <tr>
   <td rowspan="2" >Attribute
   </td>
   <td>Attribute Type
   </td>
   <td>Range
   </td>
   <td>Cardinality
   </td>
  </tr>
  <tr>
   <td colspan="3" >Definition
   </td>
  </tr>
  <tr>
   <td rowspan="2" >STATE
   </td>
   <td>Categorical
   </td>
   <td>
   </td>
   <td>47
   </td>
  </tr>
  <tr>
   <td colspan="3" >The state government that seized the property.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >RevenueID
   </td>
   <td>Categorical
   </td>
   <td>
   </td>
   <td>650244
   </td>
  </tr>
  <tr>
   <td colspan="3" >A primary key of the IJ database.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >YEAR
   </td>
   <td>Ordinal
   </td>
   <td>1989-2019
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td colspan="3" >If avaliable, the calendar year in which the property was forfeited otherwise the year the record was reported.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >UNIT_TYPE
   </td>
   <td>Categorical
   </td>
   <td>
   </td>
   <td>3
   </td>
  </tr>
  <tr>
   <td colspan="3" >Unit of observation: Possible values include:
<ul>

<li>Property

<li>Case

<li>Other. (data reported at higher levels, such as by agency, county, or state)
</li>
</ul>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >PROP_TYPE
   </td>
   <td>Categorical
   </td>
   <td>
   </td>
   <td>3
   </td>
  </tr>
  <tr>
   <td colspan="3" >Type of property forfeited. Possible values include:
<ul>

<li>Currency

<li>Automobiles

<li>Real Property
</li>
</ul>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >REV
   </td>
   <td>Quantitative
   </td>
   <td>~[0, 1,000,000,000]
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td colspan="3" >Value forfeited. Possible numeric values are calculated as one of:
<ul>

<li>Estimated value

<li>Gross revenue

<li>Net proceeds

<p>
The value varies per state, but there’s no way to determine how the revenue was calculated
</li>
</ul>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >PROCD_TYPE
   </td>
   <td>Categorical
   </td>
   <td>
   </td>
   <td>6
   </td>
  </tr>
  <tr>
   <td colspan="3" >Type of forfeiture proceeding:
<ul>

<li>Judicial - Process by which the government can seize and forfeit assets through a court proceeding.

<li>Civil Judicial - Process where court proceedings are brought against the property (as opposed to an individual) than is linked to criminal activity.

<li>Civil - Process where the government files a lawsuit against the property (as opposed to an individual) that is linked to criminal activity. No court proceedings are necessary for seizure.

<li>Criminal -Process by which a person's assets can be seized by the government as part of a criminal prosecution (after a sentencing).

<li>Administrative - Process by which the government can seize and forfeit assets without going through a court proceeding. Typically used when the owner of the asset is unknown.

<li>Unknown - No recorded value.

<p>
This column is not used in the visualization, but it provides useful background information about the different forfeiture types.
</li>
</ul>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >CONV_TYPE
   </td>
   <td>Categorical
   </td>
   <td>
   </td>
   <td>2
   </td>
  </tr>
  <tr>
   <td colspan="3" >Conviction outcome. 
<ul>

<li>Conviction

<li>No conviction.
</li>
</ul>
   </td>
  </tr>
  <tr>
   <td rowspan="2" >CASE_NO
   </td>
   <td>Categorical
   </td>
   <td>
   </td>
   <td>254869
   </td>
  </tr>
  <tr>
   <td colspan="3" >Court case number associated with conviction
   </td>
  </tr>
  <tr>
   <td rowspan="2" >Derived 
<p>
Attribute
   </td>
   <td>Attribute Type
   </td>
   <td>Range
   </td>
   <td>Cardinality
   </td>
  </tr>
  <tr>
   <td colspan="3" >Description
   </td>
  </tr>
  <tr>
   <td rowspan="2" >COUNT_PER_STATE
   </td>
   <td>Quantitative
   </td>
   <td>[0, 98153]
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td colspan="3" >To be used in the colorpleth map, this attribute will be derived using the year range specified by the user through the slider by counting the number of unique cases in each state. This attribute is used to color the states.
   </td>
  </tr>
  <tr>
   <td rowspan="2" >ratio
   </td>
   <td>Quantitative
   </td>
   <td>[0,1]
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td colspan="3" >To be used in the line chart, every rendered point is plotted using the ratio: number of convictions / (number of convictions + non convictions) 
   </td>
  </tr>
</table>



## 4. Tasks 

We have a few tasks our visualization can accomplish:



1. _Compare_ the total value of each property type seized by year and_ discover_ which are most seized for a particular state. 

    This is accomplished with a stacked bar graph, where each bar represents a property type with the length being the total value seized for that type, allowing us to see what property type is most seized.

2. _Compare_ the proportion of each property type that is convicted for a particular state and time period. 

    This is accomplished with our stacked bars. The stacked bars subdivided based on conviction showing the proportion that were found innocent vs guilty by length.

3. _Identify_ trends in the amount seized per year for a particular state. 

    This is accomplished by our line chart where each point is sized in relation to the number of cases in a given year. Comparing how the size of the points throughout the years will give us an idea of how case count changes over time.

4. _Discover_ trends over time in the proportion of seized property that results in conviction for a particular state. 

    This is accomplished through the line chart where a ratio of conviction over total case count is being plotted. Analyzing the change over time will give us a good idea of what proportion of seizures result in conviction.



## 5. Visualizations 

Our visualization has three views: a choropleth map view showing the number of cases in different states in the US, a stacked bar graph view showing the total value of seizure for different property types, and a line chart that shows how the proportion of true convictions change over time. Our visualization will also contain filter options and various tooltips to show related information on the hoverable components.



<p id="gdcalert2" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image2.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert3">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image2.png "image_tooltip")


The use of the year slider widget allows both the line chart and the bar graph to be updated with values that occur between those years. 



<p id="gdcalert3" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image3.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert4">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image3.png "image_tooltip")



### Choropleth Map View:

The choropleth map in this view is a U.S. map that uses saturation to show the amount of seizures in each state within the dataset's maximum year range of 1986 -2019. In order to get a precise value of the amount of seizures in a given year, a tooltip was used. Clicking on a certain state will update the line chart and the stacked bar chart in the other two views to contain data only relevant to that state. 

<p id="gdcalert4" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image4.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert5">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image4.png "image_tooltip")



### Line Chart View:

This view supports task 3 and task 4 in visualizing the total amount of each property type seized over the years through size encoding point marks and_ _identifying trends over time in the proportion of seized property that results in conviction for a particular state.

In this view, we designed a line chart composed of scattered data points of years with known data, and disconnected lines between data points of similar property type and consecutive years. Each data point is further size encoded based on the case count. The data point with a certain year and property type will be larger if there are many instances.

Every rendered data point was derived by grouping the data by year and taking a ratio between the observations that lead to a conviction and the total number of cases in a year. By default the view displays the trend on a national scale, but individual states can be selected on the choropleth map and the line chart will be updated accordingly. 

Each state of lines and pairs are colored by their respective property type. As the attribute is categorical, color hue was used to differentiate lines. To remain accessible to the approximate 4% of Americans who are colorblind, we chose to use a color blind friendly palette taken from ColorBrewer.

A tooltip will appear with specific information about a given year when the user hovers over a datapoint. Many of the data points contain a ratio of 1 which results in overlapping marks, the design decision was made to highlight the selected with black when hovered over so the user can explicitly tell by color and title that they are hovering over the data point they’re interested in.



<p id="gdcalert5" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image5.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert6">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image5.png "image_tooltip")


There is a bidirectional link that exists between the stacked bar graph and the line chart. When a user hovers over a line, the corresponding bar mark is highlighted through the slight enlargement of the mark (left image). Inversely, when the user hovers over a particular bar mark, the associated line is highlighted black (middle image). For reference, the right image when the user hovers over neither mark.



<p id="gdcalert6" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image6.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert7">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image6.png "image_tooltip")


<p id="gdcalert7" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image7.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert8">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image7.png "image_tooltip")


<p id="gdcalert8" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image8.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert9">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image8.png "image_tooltip")




<p id="gdcalert9" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image9.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert10">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image9.png "image_tooltip")



### Stacked Bar Chart View:

This view supports task 1 and 2 in comparing the total value of each property type seized and the proportion of conviction type within each property type in all states or selected state and within a time period selected by the year slider.

In this view, we designed a stacked bar graph to show the sum of the revenue for property typein the years selected by the year slider and in all states or the state selected in the choropleth map. For every bar, it will be color encoded based on their conviction type.

It is very likely that a user would want to visualize a property type’s trend individually. They are able to accomplish this through a unidirectional link between the bar graph and the line chart. By clicking on a bar mark, the line chart will filter out any of the data that isn’t associated with the property type of the bar mark. This is designed in such a way that only 1 selection can be made at a time. 



<p id="gdcalert10" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image10.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert11">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image10.png "image_tooltip")


The tooltip is utilized to show more information about a specific sub-bar. Mousing over a particular bar will give the total revenue associated with the conviction type.



<p id="gdcalert11" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image11.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert12">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image11.png "image_tooltip")


<p id="gdcalert12" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image12.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert13">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image12.png "image_tooltip")



## 6. Usage Scenarios 

Naomi is a policy maker from Nevada who wants to review civil asset forfeiture laws within her jurisdiction and see what civil protections should be added for certain property types. To do this she wants to see the total value of different types of property seized at a state level and the proportion that were convicted vs not convicted for each. 

She begins by reading the brief overview given on the right of the choropleth map for helpful information about civil asset forfeiture and learns important contextual information to keep in mind while reading the data.

Eager to continue Naomi is largely interested in data from her own state so she clicks on Nevada bringing up a line chart showing the total value of each property seized per year and a stacked bar showing the value distribution of the total seizure over the time period selected for each property type subdivided into whether or not that property seizure resulted in conviction. 



<p id="gdcalert13" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image13.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert14">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image13.png "image_tooltip")


Naomi notes the convicted percentage for vehicle seizure is much lower than other property types represented in the bar chart. Knowing that Maryland passed a new law for protections for vehicles in 2008, Naomi switches her state view to Maryland using the chloropleth map and uses the slider to set the year range from 2007 - 2019 so she’s only seeing the years briefly before and after the law was passed. As she is only interested in seizures related to vehicles, she selects the corresponding mark to filter out all other property types.



<p id="gdcalert14" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image14.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert15">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image14.png "image_tooltip")


Then using the line chart she compares the point size and line height for vehicles. While the point sizes vary, she sees large points in the years 2018, 2013, and 2010 which indicates to her that the conviction rate during those years are based on a larger number of cases further supporting the soundness of the ratio. As the lines move closer to a 100% conviction rate after 2008, with the ratio of convictions to total seizure increasing, indicating to her a more just system.

Seeing how well it worked for Colorado and the issues in her own state through the visualization, Naomi decides to use the Colorado law as a starting point to write new policies for Nevada.


## 7. Reflection

Our initial idea was imputing incomplete observations with values that make no assumption as to the actual value, such as “Unknown”, “Other” or 0. Unfortunately, this dataset was especially messing requiring approximately 80% of observations to be imputed in some way or another. The downside to this method was sparsity of observations which had original information regarding the court proceeding outcome (CONV_TYPE) and the type of property that was seized (PROP_TYPE). The sparsity inhibited the primary goal of this visualization which was the exploration of trends over time in regards to conviction outcome. The specific steps we did to impute the data is better explained in the section regarding data, but we essentially tried to maintain the original ratios of property type and conviction rate. The original intention of exploring trends over time has been muddled as a tradeoff for a denser visualization. 

While the ratios were maintained, this does not accurately reflect the context behind forfeitures. In reality, many seizures target property that does not belong to a listed owner, such as illegal contraband, rather than property with a particular individual. Additionally, not all seizures result in the individual going to court. The original dataset gave no indication whether the data remained unfilled because of one of the previously listed reasons or if the information was redacted from the state, so our group opted to apply imputation to all observations.

Our biggest change between each milestone was around our bottom plot, which would have been used to show any trend over time. In milestone 1, we considered creating a parallel coordinates plot with years and revenue being plotted. This didn’t work because the data points, which would have been an aggregation of total revenue for each property type, were sparse, with many observations falling into the unknown and other categories. 



<p id="gdcalert15" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image15.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert16">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image15.png "image_tooltip")


Our next idea involved creating a small multiples graph that combined a scatterplot with a histogram. At most each of the approximate 600k data points were being rendered at a time. As a result the interactions were slow, unresponsive, and often led to crashes due to memory issues. This particular visualization was bad at several things; due to the large amount of data points and the use of randomization to display the points, selecting a single point of interest was next to impossible because of the large amount of overplotting. Additionally, the histogram was not good at showing trends over time, because every state has a different range of years in which they recorded their seizures. The booming number of cases after 2007 is simply indicative of the period of time in which states began reporting their data.



<p id="gdcalert16" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image16.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert17">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image16.png "image_tooltip")


Our third and current iteration for this view was a line chart that plotted how the ratio of convictions changed over time. Due to the inefficiencies behind plotting every individual data point, we knew that we should create an aggregation to remove the bulk of the data points. After discussion with TAs, we decided to create a line plot of ratios and years using imputate data. Imputation was necessary because many states did not have available information for conviction type. The aggregation of all states in our non imputated dataset would give us the following image.



<p id="gdcalert17" ><span style="color: red; font-weight: bold">>>>>>  gd2md-html alert: inline image link here (to images/image17.png). Store image on your image server and adjust path/filename/extension if necessary. </span><br>(<a href="#">Back to top</a>)(<a href="#gdcalert18">Next alert</a>)<br><span style="color: red; font-weight: bold">>>>>> </span></p>


![alt_text](images/image17.png "image_tooltip")


Throughout the milestones, this visualization went through an incredible amount of reworks. Regardless, our original intention of looking for trends had never changed between all three interactions. Interestingly, our third iteration looks very similar to what the parallel coordinate idea would have been like. If the idea of heavy imputation was considered from the start, we would have most likely kept the parallel coordinate idea. Thankfully, we were able to experience more of what d3 has to offer through the different iterations.

From our experience in our small multiples graph, d3 struggles when rendering large amounts of data. Some group members have expressed interest in the potential optimizations that can be done to see if it were possible to render that hundreds of thousands of data points while still ensuring an acceptable level of responsiveness, similar to the gun violence visualization project in 2022W). We ended up abandoning this idea, but it will be something that can be further explored in our own time.

One other thing we attempted was to have the slider affect the choropleth as well as the line and bar charts, showing only the total conviction values and colors according to what was in that year’s range for each state. We did manage to get this working but it was quickly scrapped for being too slow. This was because each move of the slider was recomputing the total number of seizures for each individual state from our whole dataset which totals some ~600,000 points. This would have been a nice thing to have but with our implementation it’s only feasible on a smaller dataset.

Our biggest regret was creating a visualization with incredibly untidy data. Our method of imputation was somewhat naive and more background research on this topic could be necessary to better emulate the state and national trends for civil forfeiture. If any visualization project should be made in the future, preliminary visualizations should be statically created using graphing libraries from other programming languages to analyze the viability of the data. If this were done for this project from the start, our group would have potentially discussed other alternative datasets.


## 8. Work breakdown and schedule

The color of each row corresponds to the individual tasked with that portion of the project. If it’s white it will be done together.

The original work schedule was created until the assumption we were going to make a parallel coordinates graph. The intention of the team has pivoted into creating a small multiples graph (scatter plot and histogram) instead. Work items that were affected by this change are denoted by an asterik (*).


<table>
  <tr>
   <td>Task
   </td>
   <td>Description
   </td>
   <td>Est. Time (Hrs)
   </td>
   <td>Act. Time (Hrs)
   </td>
   <td>Comp. Date
   </td>
  </tr>
  <tr>
   <td colspan="5" >Misc Items (Not associated with a single view)
   </td>
  </tr>
  <tr>
   <td>Read Data
   </td>
   <td>Read and do the necessary preprocessing to the dataset in javascript.
   </td>
   <td>1
   </td>
   <td>2
   </td>
   <td>03/18
   </td>
  </tr>
  <tr>
   <td>Impute Data
   </td>
   <td>Do the necessary preprocessing for filling in a large quantity of missing data in the dataset in javascript.
   </td>
   <td>4
   </td>
   <td>10
   </td>
   <td>04/
   </td>
  </tr>
  <tr>
   <td>Layout Static Components (1)
   </td>
   <td>In HTML, create the &lt;div> and set up a location on the screen for each of the view components. The slider, the exposition, and the 3 graphs. The positioning should be done in CSS
   </td>
   <td>3
   </td>
   <td>3
   </td>
   <td>03/18
   </td>
  </tr>
  <tr>
   <td>Write Up Exposition
   </td>
   <td>Write a brief description that explains the purpose of the visualization to the user (HTML)
   </td>
   <td>1
   </td>
   <td>1
   </td>
   <td>04/13
   </td>
  </tr>
  <tr>
   <td>Create JS Classes
   </td>
   <td>For each view/component, create a standard initVis(), updateVis(), renderVis() class.
   </td>
   <td>1
   </td>
   <td>0.5
   </td>
   <td>03/18
   </td>
  </tr>
  <tr>
   <td colspan="5" >Slider
   </td>
  </tr>
  <tr>
   <td>Create Slider Component
   </td>
   <td>Preferrably, in HTML/CSS to visually render the slider on the screen.
   </td>
   <td>4
   </td>
   <td>4
   </td>
   <td>04/03
   </td>
  </tr>
  <tr>
   <td>Add Slider Functionality
   </td>
   <td>In Javascript, write a slider class. Include a function that takes the data, and the two years to return a filtered version of data.
   </td>
   <td>2
   </td>
   <td>3
   </td>
   <td>04/05
   </td>
  </tr>
  <tr>
   <td>Slider debugging
   </td>
   <td>The total amount of time spend individually debugging, if the developer doesn’t understand how to tackle a problem in the given time a team meeting should be scheduled
   </td>
   <td>3
   </td>
   <td>5
   </td>
   <td>04/13
   </td>
  </tr>
  <tr>
   <td colspan="5" >Chloropleth Map: Example on 447-material repository
   </td>
  </tr>
  <tr>
   <td>Create static elements
   </td>
   <td>As much as possible, create the static elements (elements that will remain unchanged regardless of data) in HTML/CSS 
   </td>
   <td>3
   </td>
   <td>2
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create color Scale
   </td>
   <td>Each state will be colored based on this scale. So the value should represent the total number of entries in our data for a given state. Values which have no data should be zero.(initVis)
   </td>
   <td>2
   </td>
   <td>.5
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create the map
   </td>
   <td>Preliminarily, this will be a chloropleth map, but it could be a grid cartogram which will add time (renderVis)
   </td>
   <td>4
   </td>
   <td>2
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Render a legend
   </td>
   <td>The position of the legend should be decided in html and css, but contents should be created in javascript. This is dynamically changing since the user can move around the slider which inevitably changes the max and min count per state.
   </td>
   <td>4
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Add on click func.
   </td>
   <td>When a state is clicked, update the two other views. This task does not have to update the views directly, but development should take the future feature into consideration
   </td>
   <td>2
   </td>
   <td>3
   </td>
   <td>04/12
   </td>
  </tr>
  <tr>
   <td>Filter state
   </td>
   <td>When a state is clicked, filter the original dataset to only include data from that state and within whatever period of time the slider is set to.
   </td>
   <td>3
   </td>
   <td>5
   </td>
   <td>04/12
   </td>
  </tr>
  <tr>
   <td>Create tooltip
   </td>
   <td>Create a tooltip in CSS html and add the functionality of: If it’s moused over a state, display the number and the amount of cases reported.
   </td>
   <td>2
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Debugging
   </td>
   <td>The total amount of time spend individually debugging, if the developer doesn’t understand how to tackle a problem in the given time a team meeting should be scheduled
   </td>
   <td>5
   </td>
   <td>3
   </td>
   <td>04/13
   </td>
  </tr>
  <tr>
   <td colspan="5" >Stacked Bar Plot: Example on 447-material repository
   </td>
  </tr>
  <tr>
   <td>Create static elements
   </td>
   <td>As much as possible, create the static elements (elements that will remain unchanged regardless of data) in HTML/CSS 
   </td>
   <td>4
   </td>
   <td>3
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create X-axis
   </td>
   <td>This will be a d3.scaleBand whose domain will be the 4 PROP_TYPEs
   </td>
   <td>1
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create Y-axis
   </td>
   <td>The domain will be the count of records of a given PROP_TYPE. As the range is very large, a d3.scaleLinear shouldn’t be used, consider using a logScale.
   </td>
   <td>1
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create Stack generator
   </td>
   <td>Initialize with d3.stack() and specify the keys that we will create our subbars out of. PROCD_TYPE or CONV_TYPE.
   </td>
   <td>1
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create color Scale
   </td>
   <td>Create a scale to give each color sub bar a unique color.
   </td>
   <td>1
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Render a legend
   </td>
   <td>The position of the legend should be decided in html and css, but contents should be created in javascript. This is dynamically changing since there’s a high likelihood that there are no values PROCD_TYPE/CONV_TYPE for a given state.
   </td>
   <td>4
   </td>
   <td>4
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Prepare interaction functionality (CSS)
   </td>
   <td>Create CSS classes and styling that will highlight a bar/subbar if the user scrolls over a chart
   </td>
   <td>3
   </td>
   <td>1
   </td>
   <td>04/05
   </td>
  </tr>
  <tr>
   <td>Append stacked Bars to chart
   </td>
   <td>Complete all the renderVis() using join.
   </td>
   <td>1
   </td>
   <td>5
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create tooltip
   </td>
   <td>Create a tooltip in CSS html and add the functionality of: If it’s moused subbar it’ll show information about the number of cases, and well as the conv type and procd type. (If avaliable)
   </td>
   <td>2
   </td>
   <td>1
   </td>
   <td>04/06
   </td>
  </tr>
  <tr>
   <td>Debugging
   </td>
   <td>The total amount of time spend individually debugging, if the developer doesn’t understand how to tackle a problem in the given time a team meeting should be scheduled
   </td>
   <td>5
   </td>
   <td>8
   </td>
   <td>04/13
   </td>
  </tr>
  <tr>
   <td colspan="5" >Small Multiples (Scatter Plot and Histogram) (Dropped Idea)
   </td>
  </tr>
  <tr>
   <td>Binning the data
   </td>
   <td>Whenever possible, bin the data into 3-5 equivalent bins based on year.
   </td>
   <td>4
   </td>
   <td>8
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Create static elements
   </td>
   <td>As much as possible, create the static elements (elements that will remain unchanged regardless of data) in HTML/CSS 
   </td>
   <td>3
   </td>
   <td>2
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>* Create Histogram Bins
   </td>
   <td>Group the data into individual years, and perform a d3 rollup to get the same amount of bins per year. 
   </td>
   <td>2
   </td>
   <td>3
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create X-axis
   </td>
   <td>The domain should be discrete points that correspond to every year within the data. d3.scaleBand
   </td>
   <td>2
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create Y-axis
   </td>
   <td>The domain will be the revenue. as the range is very large and possibly negative a different scale should be used. We ended up using a symmetric log scale
   </td>
   <td>2
   </td>
   <td>2
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>* Create Count-Axis
   </td>
   <td>The domain will be the maximum count from all of the year’s bins. This work breakdown includes creating the 
   </td>
   <td>2
   </td>
   <td>1
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Create CSS classes (Types)
   </td>
   <td>For each PROCD_TYPE and CONV_TYPE create a CSS class that contains a unique color for each point. 
   </td>
   <td>4
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create CSS classes (selected/unselected)
   </td>
   <td>Create a CSS class that emphasizes certain classes, but not the others similar to the scatterplot in p2.
   </td>
   <td>3
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>* Render the points
   </td>
   <td>Complete all the renderVis() using join. Due to the transition to small multiples, we implemented a gaussian boxer
   </td>
   <td>3
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Create tooltip
   </td>
   <td>Create a tooltip in CSS html and add the functionality of: If it’s moused over a point it’ll show case number (if avaliable)
   </td>
   <td>2
   </td>
   <td>1
   </td>
   <td>03/26
   </td>
  </tr>
  <tr>
   <td>Debugging
   </td>
   <td>The total amount of time spend individually debugging, if the developer doesn’t understand how to tackle a problem in the given time a team meeting should be scheduled
   </td>
   <td>5
   </td>
   <td>3
   </td>
   <td>04/14
   </td>
  </tr>
  <tr>
   <td colspan="5" >Line Chart
   </td>
  </tr>
  <tr>
   <td>Initial Setup
   </td>
   <td>Much of the structure was taken from the original small multiples setup, 
   </td>
   <td>2
   </td>
   <td>5
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Deriving new data
   </td>
   <td>Vis.datapoint and vis.lineData
   </td>
   <td>2
   </td>
   <td>2
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td>Debugging iterations
   </td>
   <td>Log time associated with multiview interactions here.
   </td>
   <td>?
   </td>
   <td>2
   </td>
   <td>
   </td>
  </tr>
  <tr>
   <td colspan="5" >View Interaction
   </td>
  </tr>
  <tr>
   <td>Slider - Rest
   </td>
   <td>If the slider encompasses a different range of years, the other views should be updated to support the new subset. Updating the slider will not clear the current selections.
   </td>
   <td>3
   </td>
   <td>3
   </td>
   <td>04/02
   </td>
  </tr>
  <tr>
   <td>Map - Bar
   </td>
   <td>Clicking on a certain state will update the barchart with just those state views.
   </td>
   <td>5
   </td>
   <td>1
   </td>
   <td>03/29
   </td>
  </tr>
  <tr>
   <td>Map - Line Chart
   </td>
   <td>Clicking on a certain state will update the parallel coordinate plot to data points just from that state.
   </td>
   <td>5
   </td>
   <td>1
   </td>
   <td>03/29
   </td>
  </tr>
  <tr>
   <td rowspan="2" >* Bar - line Chart
   </td>
   <td>Clicking on a bar (PROP_TYPE) will highlight data points associated with that property type in the line chart. All other points will be invisible
   </td>
   <td>5
   </td>
   <td>1
   </td>
   <td>04/10
   </td>
  </tr>
  <tr>
   <td>Hovering over a sub bar (PROCD_TYPE/CONV_TYPE) will highlight data points associated with that type in the line plot.
   </td>
   <td>5
   </td>
   <td>1
   </td>
   <td>04/10
   </td>
  </tr>
  <tr>
   <td>* Line Chart - Bar
   </td>
   <td>Hovering over a point will highlight the subbar that it belongs in.
   </td>
   <td>3
   </td>
   <td>1
   </td>
   <td>04/10
   </td>
  </tr>
  <tr>
   <td colspan="5" >Report Creating
   </td>
  </tr>
  <tr>
   <td>Video Walkthrough
   </td>
   <td>Creating the video walkthrough of the visualization.
   </td>
   <td>2 hrs
   </td>
   <td>2
   </td>
   <td>04/14
   </td>
  </tr>
  <tr>
   <td>Report writing
   </td>
   <td>Writing up the supplementary document that showcases the project.
   </td>
   <td>?
   </td>
   <td>3
   </td>
   <td>04/14
   </td>
  </tr>
  <tr>
   <td>Report writing
   </td>
   <td>Writing up the supplementary document that showcases the project.
   </td>
   <td>5 hrs
   </td>
   <td>5
   </td>
   <td>04/13
   </td>
  </tr>
  <tr>
   <td>Report writing
   </td>
   <td>Writing up the supplementary document that showcases the project.
   </td>
   <td>4 hrs
   </td>
   <td>4
   </td>
   <td>04/13
   </td>
  </tr>
</table>



## 9. Credits



* The small multiples graphs was inspired by [https://d3-graph-gallery.com/graph/violin_jitter.html](https://d3-graph-gallery.com/graph/violin_jitter.html).
* The calculation of sumstat and xnum was heavily inspired by this post, but as this was developed with depreciated D3 functions, they were completely rewritten in our project to use Javascript ES6 and D3 v6.
* Was removed in our final iteration.
* The jitter added in the scatter plot utilized the box-muller method to create noise that follows a gaussian distribution. Code was taken directly from this stack overflow post. [https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve](https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve)
    * Was removed in our final iteraton
* The geographical data for the choropleth map is from [https://github.com/topojson/us-atlas](https://github.com/topojson/us-atlas) 
* The slider component was inspired by https://github.com/johnwalley/d3-simple-slider/blob/master/src/slider.js and [https://observablehq.com/@sarah37/snapping-range-slider-with-d3-brush](https://observablehq.com/@sarah37/snapping-range-slider-with-d3-brush). Some code directly taken from the second link.
* The stacked bar chart contains code directly taken from CPSC447 d3-example:stacked-bar-chart
* The choropleth map also contains code taken directly from the CPSC447 d3-example:choropleth-map
