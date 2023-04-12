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
    revenue["PROCD_TYPE"] = revenue["PROCD_TYPE"].fillna("Unknown")
    revenue["PROCD_TYPE"] = revenue["PROCD_TYPE"].replace("Civil Jud", "Civil Judicial")
    revenue["PROCD_TYPE"] = revenue["PROCD_TYPE"].replace("Civil ", "Civil")
    revenue["PROCD_TYPE"] = revenue["PROCD_TYPE"].replace("Admin", "Administrative")

    revenue["CONV_TYPE"] = revenue["CONV_TYPE"].str.title()
    revenue["CONV_TYPE"] = revenue["CONV_TYPE"].fillna("Unknown")

    revenue["CASE_NO"] = revenue["CASE_NO"].fillna("Unknown")

    revenue["REV"] = revenue["REV"].fillna(0)

    # Checks for either zero or na year values. The number of zeros are insignificant enough for us to simply drop.
    # With approximately 46k instances of np.nan we decided to randomly impute them with a value between 2001 and 2010
    revenue = revenue.drop(revenue[(revenue['YEAR'] == 0)].index)
    revenue.loc[revenue["YEAR"].isna(), "YEAR"] = np.random.randint(2001, 2020, size=len(revenue[revenue['YEAR'].isna()]['YEAR']))

    print(revenue[categories].nunique())
    print(revenue.columns)

    # NEW PROCESSING

    # Global Ratio of convicted and known (used in states where we have no known values)
    conv_count = (revenue["CONV_TYPE"].values == 'Conviction').sum()
    non_unknown_count = (revenue["CONV_TYPE"].values != 'Unknown').sum()
    conv_known_ratio = conv_count / non_unknown_count

    # Global Ration of prop types
    vehicle_count = (revenue["PROP_TYPE"].values == 'Vehicles').sum()
    real_count = (revenue["PROP_TYPE"].values == 'Real Property').sum()
    prop_known_count = (revenue["PROP_TYPE"].values != 'Other').sum()
    vehicle_known_ratio = vehicle_count / prop_known_count
    real_known_ratio = real_count / prop_known_count

    # Determine the number conv needed for each state
    state_dict = {}
    state_prop = {}
    states = revenue["STATE"].unique()

    for state in states:
        # CONV_TYPE
        state_dict[state] = 0
        unknown_state = ((revenue["CONV_TYPE"].values == 'Unknown') & (revenue["STATE"].values == state)).sum()
        conv_state = ((revenue["CONV_TYPE"].values == 'Conviction') & (revenue["STATE"].values == state)).sum()
        known_state = ((revenue["CONV_TYPE"].values != 'Unknown') & (revenue["STATE"].values == state)).sum()
        if known_state == 0:
            state_dict[state] = (int) (unknown_state * conv_known_ratio)
        else:
            state_dict[state] = (int) (unknown_state * (conv_state / known_state))

        # PROP_TYPE
        state_vehicle_num = 0
        state_real_num = 0

        prop_unknown_state = ((revenue["PROP_TYPE"].values == 'Other') & (revenue["STATE"].values == state)).sum()
        vehicle_state = ((revenue["PROP_TYPE"].values == 'Vehicles') & (revenue["STATE"].values == state)).sum()
        real_state = ((revenue["PROP_TYPE"].values == 'Real Property') & (revenue["STATE"].values == state)).sum()
        prop_known_state = ((revenue["PROP_TYPE"].values != 'Other') & (revenue["STATE"].values == state)).sum()

        if prop_known_state == 0:
            state_vehicle_num = (int) (vehicle_known_ratio * prop_unknown_state)
            state_real_num = (int) (real_known_ratio * prop_unknown_state)
        else:
            state_vehicle_num = (int) ((vehicle_state / prop_known_state) * prop_unknown_state)
            state_real_num = (int) ((real_state / prop_known_state) * prop_unknown_state)
        state_prop[state] = [state_vehicle_num, state_real_num]

    print(state_dict)
    print(state_prop)
    # Modify Dataframe
    for index, row in revenue.iterrows():
        print(index)
        if row["CONV_TYPE"] == 'Unknown':
            if state_dict[row["STATE"]] > 0:
                revenue.loc[index, "CONV_TYPE"] = 'Conviction'
                state_dict[row["STATE"]] -= 1
            else:
                revenue.loc[index, "CONV_TYPE"] = 'No Conviction'

        if row["PROP_TYPE"] == 'Other':
            if state_prop[row["STATE"]][0] > 0:
                revenue.loc[index, "PROP_TYPE"] = 'Vehicles'
                state_prop[row["STATE"]][0] -= 1

            elif state_prop[row["STATE"]][1] > 0:
                revenue.loc[index, "PROP_TYPE"] = 'Real Property'
                state_prop[row["STATE"]][1] -= 1

            else:
                revenue.loc[index, "PROP_TYPE"] = 'Currency'

    revenue.to_csv("processed_revenue.csv", index=False)


if __name__ == "__main__":
    main()