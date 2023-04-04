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

    revenue.drop(revenue[(revenue['YEAR'] == 0)].index, inplace=True)

    print(revenue[categories].nunique())
    print(revenue.columns)

    revenue.to_csv("processed_revenue.csv", index=False)


if __name__ == "__main__":
    main()