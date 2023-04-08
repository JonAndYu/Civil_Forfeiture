from __future__ import division
import numpy as np
import pandas as pd

def main():
    revenue = pd.read_csv("National_Revenue.csv")

    categories = ["UNIT_TYPE", "PROP_TYPE"]

    # For these two categories, there are cases like: "other", "OTHER", "Other"
    # So we standardize them to be consistant with title labels "Other"
    # Any np.nan value gets replace by "Other"
    for category in categories:
        revenue[category] = revenue[category].str.title()
        revenue[category] = revenue[category].fillna("Other")

    revenue["PROCD_TYPE"] = revenue["PROCD_TYPE"].str.title()
    revenue["PROCD_TYPE"] = revenue["PROCD_TYPE"].fillna("Other")
    revenue["PROCD_TYPE"] = revenue["PROCD_TYPE"].replace("Civil Jud", "Civil Judicial")
    revenue["PROCD_TYPE"] = revenue["PROCD_TYPE"].replace("Civil ", "Civil")
    revenue["PROCD_TYPE"] = revenue["PROCD_TYPE"].replace("Admin", "Administrative")

    revenue["CONV_TYPE"] = revenue["CONV_TYPE"].str.title()
    revenue["CONV_TYPE"] = revenue["CONV_TYPE"].fillna("Unknown")

    revenue["CASE_NO"] = revenue["CASE_NO"].fillna("Unknown")

    revenue["REV"] = revenue["REV"].fillna(0)

    revenue = revenue.drop(revenue[(revenue['YEAR'] == 0)].index)

    print(revenue[categories].nunique())
    print(revenue.columns)

    # NEW PROCESSING

    # Global Ration of convicted and known (used in states where we have no known values)
    conv_count = (revenue["CONV_TYPE"].values == 'Conviction').sum()
    non_unknown_count = (revenue["CONV_TYPE"].values != 'Unknown').sum()
    conv_known_ratio = conv_count / non_unknown_count

    # Determine the number conv needed for each state
    state_dict = {}
    states = revenue["STATE"].unique()

    for state in states:
        state_dict[state] = 0
        unknown_state = ((revenue["CONV_TYPE"].values == 'Unknown') & (revenue["STATE"].values == state)).sum()
        conv_state = ((revenue["CONV_TYPE"].values == 'Conviction') & (revenue["STATE"].values == state)).sum()
        known_state = ((revenue["CONV_TYPE"].values != 'Unknown') & (revenue["STATE"].values == state)).sum()
        if (known_state == 0):
            state_dict[state] = (int) (unknown_state * conv_known_ratio)
        else:
            state_dict[state] = (int) (unknown_state * (conv_state / known_state))

    print(state_dict)

    # Modify Dataframe
    for index, row in revenue.iterrows():
        print(index)
        if row["CONV_TYPE"] == 'Unknown':
            if state_dict[row["STATE"]] > 0:
                revenue.loc[index, "CONV_TYPE"] = 'Conviction'
                state_dict[row["STATE"]] -= 1
            else:
                revenue.loc[index, "CONV_TYPE"] = 'No Conviction'

    revenue.to_csv("processed_revenue.csv", index=False)


if __name__ == "__main__":
    main()